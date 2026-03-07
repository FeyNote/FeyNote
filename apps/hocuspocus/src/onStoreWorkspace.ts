import { encodeStateAsUpdate } from 'yjs';
import { onStoreDocumentPayload } from '@hocuspocus/server';
import { prisma } from '@feynote/prisma/client';
import { enqueueWorkspaceUpdate } from '@feynote/queue';
import {
  getWorkspaceMetaFromYDoc,
  getWorkspaceArtifactsFromYDoc,
  getWorkspaceThreadsFromYDoc,
  getWorkspaceAccessLevel,
  getWorkspaceUserAccessFromYDoc,
} from '@feynote/shared-utils';
import { logger, syncWorkspaceRelations } from '@feynote/api-services';
import { ArtifactAccessLevel, Prisma } from '@prisma/client';

export async function onStoreWorkspace(
  args: onStoreDocumentPayload,
  identifier: string,
) {
  const yBin = Buffer.from(encodeStateAsUpdate(args.document));
  const meta = getWorkspaceMetaFromYDoc(args.document);
  const artifactsKV = getWorkspaceArtifactsFromYDoc(args.document);
  const threadsKV = getWorkspaceThreadsFromYDoc(args.document);
  const userAccessKV = getWorkspaceUserAccessFromYDoc(args.document);

  const currentArtifactIds = new Set(
    [...artifactsKV.yarray.toArray()].map((el) => el.key),
  );
  const currentThreadIds = new Set(
    [...threadsKV.yarray.toArray()].map((el) => el.key),
  );
  const currentUserAccess = [...userAccessKV.yarray.toArray()];

  const updatedWorkspace = await prisma.$transaction(
    async (tx) => {
      const workspace = await tx.workspace.findUnique({
        where: { id: identifier },
        select: { userId: true, yBin: true },
      });

      if (!workspace) {
        logger.error('Attempting to save workspace that does not exist');
        throw new Error();
      }

      await tx.workspace.update({
        where: { id: identifier },
        data: {
          yBin,
          name: meta.name,
          icon: meta.icon,
          color: meta.color,
          linkAccessLevel: meta.linkAccessLevel,
          deletedAt: meta.deletedAt ? new Date(meta.deletedAt) : null,
        },
      });

      await syncWorkspaceRelations({
        tx,
        workspaceId: identifier,
        currentArtifactIds,
        currentThreadIds,
        currentUserAccess,
      });

      return workspace;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  await enqueueWorkspaceUpdate({
    workspaceId: identifier,
    userId: updatedWorkspace.userId,
    triggeredByUserId: args.context.userId,
    oldYBinB64: updatedWorkspace.yBin
      ? Buffer.from(updatedWorkspace.yBin).toString('base64')
      : '',
    newYBinB64: yBin.toString('base64'),
  });

  for (const connection of args.document.getConnections()) {
    const userId = connection.context.userId;
    const userAccess = getWorkspaceAccessLevel(args.document, userId);

    const broadcastNewAuthorizedScope = () => {
      connection.sendStateless(
        JSON.stringify({
          event: 'authorizedScopeChanged',
          data: {
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
        connection.sendStateless(JSON.stringify({ event: 'accessRemoved' }));
        connection.close();
        break;
      }
    }
  }
}
