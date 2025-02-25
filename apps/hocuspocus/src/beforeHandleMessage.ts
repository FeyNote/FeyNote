import {
  beforeHandleMessagePayload,
  IncomingMessage,
  MessageType,
} from '@hocuspocus/server';
import { messageYjsUpdate } from 'y-protocols/sync';
import { applyUpdate, encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import { ARTIFACT_USER_ACCESS_KEY } from '@feynote/shared-utils';
import * as Sentry from '@sentry/node';

import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';

/**
 * Deconstruct the IncomingMessage.
 * Messages are structured here - https://github.com/ueberdosis/hocuspocus/releases/tag/v2.0.0.
 */
export function deconstructIncomingMessage(update: Uint8Array) {
  const message = new IncomingMessage(update);
  // Note: The calls below *MUST* be in order for the message to parse correctly b/c of schema - [documentName][HocuspocusMessageType][YjsMessageType][yjs binary].
  const documentName = message.readVarString();
  const hocusPocusMessageType = message.readVarUint();
  const yjsMessageType = message.readVarUint();
  const yjsBinary = message.readVarUint8Array();

  return { documentName, hocusPocusMessageType, yjsBinary, yjsMessageType };
}

export async function beforeHandleMessage(args: beforeHandleMessagePayload) {
  try {
    const [type] = splitDocumentName(args.documentName);

    switch (type) {
      case SupportedDocumentType.Artifact: {
        // We don't need to validate field updates for the owner since they can modify all
        // if (args.context.isOwner) break;

        // Ensure received message is a document update, otherwise there is no need to validate meta/permissions
        const { hocusPocusMessageType, yjsBinary, yjsMessageType } =
          deconstructIncomingMessage(args.update);

        if (
          hocusPocusMessageType !== MessageType.Sync ||
          yjsMessageType !== messageYjsUpdate
        )
          return;

        console.log('hallo', args.context.isOwner, args.document);

        const currentBin = encodeStateAsUpdate(args.document);
        const updatedYDoc = new YDoc();

        applyUpdate(updatedYDoc, currentBin);

        let illegalUpdatePerformed = false;
        updatedYDoc.getArray(ARTIFACT_USER_ACCESS_KEY).observe(() => {
          illegalUpdatePerformed = true;
        });

        applyUpdate(updatedYDoc, yjsBinary);

        if (illegalUpdatePerformed) {
          const e = new Error('Illegal update performed');
          console.error(e);
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

        break;
      }
    }
  } catch (e) {
    console.error(e);

    throw e;
  }
}
