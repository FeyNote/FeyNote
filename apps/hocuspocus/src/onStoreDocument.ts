import { encodeStateAsUpdate } from 'yjs';
import { onStoreDocumentPayload } from '@hocuspocus/server';

import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getMetaFromYArtifact,
  getTextForJSONContent,
  getTiptapContentFromYjsDoc,
  getUserAccessFromYArtifact,
} from '@feynote/shared-utils';
import { SupportedDocumentType } from './SupportedDocumentType';
import { splitDocumentName } from './splitDocumentName';
import { logger, metrics } from '@feynote/api-services';
import { ArtifactAccessLevel } from '@prisma/client';

export async function onStoreDocument(args: onStoreDocumentPayload) {
  try {
    const [type, identifier] = splitDocumentName(args.documentName);

    metrics.hocuspocusDocumentLoad.inc({
      document_type: type,
    });

    switch (type) {
      case SupportedDocumentType.Artifact: {
        const artifact = await prisma.artifact.findUnique({
          where: {
            id: identifier,
          },
          select: {
            userId: true,
            artifactShares: {
              select: {
                userId: true,
              },
            },
            yBin: true,
            json: true,
          },
        });

        if (!artifact) {
          logger.error('Attempting to save artifact that does not exist');
          throw new Error();
        }

        const yBin = Buffer.from(encodeStateAsUpdate(args.document));

        const tiptapBody = getTiptapContentFromYjsDoc(
          args.document,
          ARTIFACT_TIPTAP_BODY_KEY,
        );
        const text = getTextForJSONContent(tiptapBody);
        const artifactMeta = getMetaFromYArtifact(args.document);
        const userAccess = getUserAccessFromYArtifact(args.document);
        const newReadableUserIds = [...userAccess.map.entries()]
          .filter((el) =>
            Array.from<ArtifactAccessLevel>([
              ArtifactAccessLevel.coowner,
              ArtifactAccessLevel.readwrite,
              ArtifactAccessLevel.readonly,
            ]).includes(el[1].val.accessLevel),
          )
          .map((el) => el[0]);

        await prisma.artifact.update({
          where: {
            id: identifier,
          },
          data: {
            title: artifactMeta.title,
            type: artifactMeta.type,
            theme: artifactMeta.theme,
            text,
            yBin,
            deletedAt: artifactMeta.deletedAt,
            json: {
              ...(artifact.json as unknown as Record<string, unknown>),
              tiptapBody,
              meta: artifactMeta,
            },
          },
        });

        await enqueueArtifactUpdate({
          artifactId: identifier,
          userId: artifact.userId,
          triggeredByUserId: args.context.userId,
          oldReadableUserIds: [
            artifact.userId,
            ...artifact.artifactShares.map((el) => el.userId),
          ],
          newReadableUserIds: [artifact.userId, ...newReadableUserIds],
          oldYBinB64: Buffer.from(artifact.yBin).toString('base64'),
          newYBinB64: yBin.toString('base64'),
        });

        break;
      }
      case SupportedDocumentType.UserTree: {
        const user = await prisma.user.findUnique({
          where: {
            id: identifier,
          },
          select: {
            treeYBin: true,
          },
        });

        if (!user) {
          logger.error('Attempting to save user tree that does not exist');
          throw new Error();
        }

        const treeYBin = Buffer.from(encodeStateAsUpdate(args.document));

        await prisma.user.update({
          where: {
            id: identifier,
          },
          data: {
            treeYBin,
          },
        });

        break;
      }
    }

    args.document.getConnections().forEach((connection) => {
      connection.sendStateless(
        JSON.stringify({
          event: 'docSaved',
        }),
      );
    });
  } catch (e) {
    if (!(e instanceof Error) || e.message) {
      logger.error(e);
    }

    throw e;
  }
}
