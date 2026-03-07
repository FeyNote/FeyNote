import { Prisma } from '@prisma/client';
import { YArtifactUserAccess } from '@feynote/global-types';

export async function syncWorkspaceRelations({
  tx,
  workspaceId,
  currentArtifactIds,
  currentThreadIds,
  currentUserAccess,
}: {
  tx: Prisma.TransactionClient;
  workspaceId: string;
  currentArtifactIds: Set<string>;
  currentThreadIds: Set<string>;
  currentUserAccess: Array<{ key: string; val: YArtifactUserAccess }>;
}): Promise<void> {
  const existingArtifactRelations = await tx.workspaceArtifact.findMany({
    where: { workspaceId },
    select: { id: true, artifactId: true },
  });
  const existingThreadRelations = await tx.workspaceThread.findMany({
    where: { workspaceId },
    select: { id: true, threadId: true },
  });
  const existingShares = await tx.workspaceShare.findMany({
    where: { workspaceId },
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

  const currentUserAccessIds = new Set(currentUserAccess.map((el) => el.key));
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
        workspaceId,
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
        workspaceId,
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
        workspaceId,
        userId: el.key,
        accessLevel: el.val.accessLevel,
      })),
    });
  }

  if (sharesToUpdate.length > 0) {
    const sqlValues = sharesToUpdate.map(
      (el) =>
        Prisma.sql`(${workspaceId}::uuid, ${el.key}::uuid, ${el.val.accessLevel}::"ArtifactAccessLevel")`,
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
}
