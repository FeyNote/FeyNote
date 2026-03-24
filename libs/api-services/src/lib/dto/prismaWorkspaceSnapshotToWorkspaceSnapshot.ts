import type { WorkspaceSnapshot } from '@feynote/global-types';
import type { PrismaWorkspaceSnapshot } from '@feynote/prisma/types';

export const prismaWorkspaceSnapshotToWorkspaceSnapshot = (
  prismaShape: PrismaWorkspaceSnapshot,
): WorkspaceSnapshot => {
  return {
    id: prismaShape.id,
    meta: {
      id: prismaShape.id,
      userId: prismaShape.userId,
      name: prismaShape.name,
      icon: prismaShape.icon,
      color: prismaShape.color,
      linkAccessLevel: prismaShape.linkAccessLevel,
      deletedAt: prismaShape.deletedAt?.getTime() || null,
      createdAt: prismaShape.createdAt.getTime(),
    },
    userAccess: prismaShape.workspaceShares.map((el) => ({
      key: el.userId,
      val: {
        accessLevel: el.accessLevel,
      },
    })),
    updatedAt: prismaShape.updatedAt.getTime(),
    artifactIds: prismaShape.workspaceArtifacts.map((el) => el.artifactId),
    threadIds: prismaShape.workspaceThreads.map((el) => el.threadId),
    // Since this is coming from Prisma, there is no world (currently) in which this can be anything
    // but false (since Prisma means that the server knows about the artifact)
    createdLocally: false,
  };
};
