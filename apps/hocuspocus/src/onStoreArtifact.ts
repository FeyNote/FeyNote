import { encodeStateAsUpdate } from 'yjs';
import { onStoreDocumentPayload } from '@hocuspocus/server';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getArtifactAccessLevel,
  getMetaFromYArtifact,
  getTextForJSONContent,
  getTiptapContentFromYjsDoc,
  getUserAccessFromYArtifact,
} from '@feynote/shared-utils';
import { logger } from '@feynote/api-services';
import { ArtifactAccessLevel } from '@prisma/client';

export async function onStoreArtifact(
  args: onStoreDocumentPayload,
  identifier: string,
) {
  const artifact = await prisma.artifact.findUnique({
    where: {
      id: identifier,
    },
    select: {
      userId: true,
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
  const userAccessPOJO = Object.fromEntries(
    [...userAccess.map.values()].map((el) => [el.key, el.val]),
  );

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
      deletedAt: artifactMeta.deletedAt
        ? new Date(artifactMeta.deletedAt)
        : null,
      json: {
        ...(artifact.json as unknown as Record<string, unknown>),
        tiptapBody,
        meta: artifactMeta,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Thanks Prisma
        userAccess: userAccessPOJO as any,
      },
    },
  });

  await enqueueArtifactUpdate({
    artifactId: identifier,
    userId: artifact.userId,
    triggeredByUserId: args.context.userId,
    oldYBinB64: Buffer.from(artifact.yBin).toString('base64'),
    newYBinB64: yBin.toString('base64'),
  });

  for (const connection of args.document.getConnections()) {
    const userId = connection.context.userId;
    const userAccess = getArtifactAccessLevel(args.document, userId);

    const invalidate = () => {
      console.warn(
        'Invalidating user connection to document due to removal of permissions',
      );

      connection.sendStateless(
        JSON.stringify({
          event: 'accessRemoved',
        }),
      );
      connection.close(); // This does not disconnect the websocket itself, just closes the pseudo "connection" to the document
    };
    const broadcastNewAuthorizedScope = () => {
      connection.sendStateless(
        JSON.stringify({
          event: 'authorizedScopeChanged',
          data: {
            documentName: args.documentName,
            authorizedScope: connection.readOnly ? 'readonly' : 'read-write',
          },
        }),
      );
    };

    switch (userAccess) {
      case ArtifactAccessLevel.coowner:
      case ArtifactAccessLevel.readwrite: {
        if (connection.readOnly) {
          connection.readOnly = false;
          broadcastNewAuthorizedScope();
        }
        break;
      }
      case ArtifactAccessLevel.readonly: {
        if (!connection.readOnly) {
          connection.readOnly = true;
          broadcastNewAuthorizedScope();
        }
        break;
      }
      case ArtifactAccessLevel.noaccess: {
        invalidate();
        break;
      }
    }
  }
}
