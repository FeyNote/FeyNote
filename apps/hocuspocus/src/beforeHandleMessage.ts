import {
  beforeHandleMessagePayload,
  IncomingMessage,
  MessageType,
} from '@hocuspocus/server';
import { messageYjsSyncStep2, messageYjsUpdate } from 'y-protocols/sync';
import {
  applyUpdate,
  encodeStateAsUpdate,
  Doc as YDoc,
  type YMapEvent,
} from 'yjs';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_USER_ACCESS_KEY,
} from '@feynote/shared-utils';
import * as Sentry from '@sentry/node';

import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';
import { memoizedShadowDocsByDocName } from './memoizedShadowDocsByDocName';
import assert from 'assert';
import { logger, metrics } from '@feynote/api-services';

/**
 * Deconstruct the IncomingMessage.
 * Messages are structured here - https://github.com/ueberdosis/hocuspocus/releases/tag/v2.0.0.
 */
export function deconstructIncomingMessage(update: Uint8Array) {
  const message = new IncomingMessage(update);
  // Note: The calls below *MUST* be in order for the message to parse correctly b/c of schema - [documentName][HocuspocusMessageType][YjsMessageType][yjs binary].

  const documentName = message.readVarString();
  const hocusPocusMessageType = message.readVarUint();

  let yjsMessageType: number | undefined;
  let yjsBinary: Uint8Array | undefined;
  if (hocusPocusMessageType === MessageType.Sync) {
    yjsMessageType = message.readVarUint();
    yjsBinary = message.readVarUint8Array();
  }

  return {
    documentName,
    hocusPocusMessageType,
    yjsBinary,
    yjsMessageType,
  };
}

const getShadowDoc = (documentName: string, baseDoc: YDoc) => {
  const existingShadowDoc = memoizedShadowDocsByDocName.get(documentName);
  if (existingShadowDoc) return existingShadowDoc;

  const shadowDoc = new YDoc();
  applyUpdate(shadowDoc, encodeStateAsUpdate(baseDoc));
  memoizedShadowDocsByDocName.set(documentName, shadowDoc);
  return shadowDoc;
};

export async function beforeHandleMessage(args: beforeHandleMessagePayload) {
  try {
    const [type] = splitDocumentName(args.documentName);

    metrics.hocuspocusMessage.inc({
      document_type: type,
    });

    const timer = metrics.hocuspocusMessageValidateTime.startTimer();

    switch (type) {
      case SupportedDocumentType.Artifact: {
        try {
          // Ensure received message is a document update, otherwise there is no need to validate meta/permissions
          const { hocusPocusMessageType, yjsBinary, yjsMessageType } =
            deconstructIncomingMessage(args.update);

          if (hocusPocusMessageType !== MessageType.Sync) return;
          if (
            yjsMessageType !== messageYjsUpdate &&
            yjsMessageType !== messageYjsSyncStep2
          )
            return;

          assert(yjsBinary, 'yjsBinary must be defined for sync message types');

          // We only need to validate changes for non-owners, since we can relatively trust an owner not to corrupt their own document, and not doing this comparison improves memory consumption and performance
          if (args.context.isOwner) {
            // We still need to keep shadow doc up to date if it exists
            const shadowDoc = memoizedShadowDocsByDocName.get(
              args.documentName,
            );
            if (shadowDoc && yjsBinary) {
              applyUpdate(shadowDoc, yjsBinary);
            }
            return;
          }

          const shadowDoc = getShadowDoc(args.documentName, args.document);

          let illegalUpdatePerformed = false;

          const artifactMetaObserver = (event: YMapEvent<unknown>) => {
            if (
              event.keysChanged.has('userId') ||
              event.keysChanged.has('linkAccessLevel')
            ) {
              illegalUpdatePerformed = true;
            }
          };
          const artifactUserAccessObserver = () => {
            illegalUpdatePerformed = true;
          };
          shadowDoc.getMap(ARTIFACT_META_KEY).observe(artifactMetaObserver);
          shadowDoc
            .getArray(ARTIFACT_USER_ACCESS_KEY)
            .observe(artifactUserAccessObserver);

          applyUpdate(shadowDoc, yjsBinary);

          shadowDoc.getMap(ARTIFACT_META_KEY).unobserve(artifactMetaObserver);
          shadowDoc
            .getArray(ARTIFACT_USER_ACCESS_KEY)
            .unobserve(artifactUserAccessObserver);

          if (illegalUpdatePerformed) {
            // We've corrupted the document state, so we need to reset it
            memoizedShadowDocsByDocName.delete(args.documentName);

            const e = new Error('Illegal update performed');
            logger.warn(e);
            Sentry.captureException(e, {
              extra: {
                userId: args.context.userId,
                documentName: args.documentName,
                yjsMessageType,
                hocusPocusMessageType,
              },
            });
            throw new Error();
          }
        } catch (e) {
          logger.error('Error while validating message', e);
          Sentry.captureException(e, {
            extra: {
              userId: args.context.userId,
              documentName: args.documentName,
            },
          });
          throw e;
        }

        break;
      }
    }

    metrics.hocuspocusMessageValidateTime.observe({
      value: timer(),
      labels: {
        document_type: type,
      },
    });
  } catch (e) {
    if (!(e instanceof Error) || e.message) {
      logger.error(e);
    }

    throw e;
  }
}
