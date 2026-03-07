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
import { logger } from '@feynote/api-services';
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

      const existingArtifactRelations = await tx.workspaceArtifact.findMany({
        where: { workspaceId: identifier },
        select: { id: true, artifactId: true },
      });
      const existingThreadRelations = await tx.workspaceThread.findMany({
        where: { workspaceId: identifier },
        select: { id: true, threadId: true },
      });
      const existingShares = await tx.workspaceShare.findMany({
        where: { workspaceId: identifier },
        select: { id: true, userId: true, accessLevel: true },
      });

      const artifactRelationsToDelete = existingArtifactRelations.filter(
        (el) => !currentArtifactIds.has(el.artifactId),
      );
      const existingArtifactIdSet = new Set(
        existingArtifactRelations.map((el) => el.artifactId),
      );
      const artifactIdsToAdd = [...currentArtifactIds].filter(
        (id) => !existingArtifactIdSet.has(id),
      );

      const threadRelationsToDelete = existingThreadRelations.filter(
        (el) => !currentThreadIds.has(el.threadId),
      );
      const existingThreadIdSet = new Set(
        existingThreadRelations.map((el) => el.threadId),
      );
      const threadIdsToAdd = [...currentThreadIds].filter(
        (id) => !existingThreadIdSet.has(id),
      );

      const currentUserAccessIds = new Set(
        currentUserAccess.map((el) => el.key),
      );
      const existingSharesByUserId = new Map(
        existingShares.map((s) => [s.userId, s]),
      );
      const sharesToDelete = existingShares.filter(
        (el) => !currentUserAccessIds.has(el.userId),
      );
      const sharesToCreate = currentUserAccess.filter(
        (el) => !existingSharesByUserId.has(el.key),
      );
      const sharesToUpdate = currentUserAccess.filter((el) => {
        const existing = existingSharesByUserId.get(el.key);
        return existing && existing.accessLevel !== el.val.accessLevel;
      });

      if (artifactRelationsToDelete.length > 0) {
        await tx.workspaceArtifact.deleteMany({
          where: {
            id: { in: artifactRelationsToDelete.map((el) => el.id) },
          },
        });
      }
      if (artifactIdsToAdd.length > 0) {
        await tx.workspaceArtifact.createMany({
          data: artifactIdsToAdd.map((artifactId) => ({
            workspaceId: identifier,
            artifactId,
          })),
        });
      }

      if (threadRelationsToDelete.length > 0) {
        await tx.workspaceThread.deleteMany({
          where: {
            id: { in: threadRelationsToDelete.map((el) => el.id) },
          },
        });
      }
      if (threadIdsToAdd.length > 0) {
        await tx.workspaceThread.createMany({
          data: threadIdsToAdd.map((threadId) => ({
            workspaceId: identifier,
            threadId,
          })),
        });
      }

      if (sharesToDelete.length > 0) {
        await tx.workspaceShare.deleteMany({
          where: {
            id: { in: sharesToDelete.map((el) => el.id) },
          },
        });
      }
      if (sharesToCreate.length > 0) {
        await tx.workspaceShare.createMany({
          data: sharesToCreate.map((el) => ({
            workspaceId: identifier,
            userId: el.key,
            accessLevel: el.val.accessLevel,
          })),
        });
      }

      if (sharesToUpdate.length > 0) {
        const sqlValues = sharesToUpdate.map(
          (el) =>
            Prisma.sql`(${identifier}::uuid, ${el.key}::uuid, ${el.val.accessLevel}::"ArtifactAccessLevel")`,
        );

        await tx.$executeRaw`
          UPDATE "WorkspaceShare" AS ws SET
            "accessLevel" = c."accessLevel"
          FROM (VALUES
            ${Prisma.join(sqlValues)}
          ) AS c("workspaceId", "userId", "accessLevel")
          WHERE
            c."workspaceId" = ws."workspaceId"
            AND c."userId" = ws."userId"
        `;
      }

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
