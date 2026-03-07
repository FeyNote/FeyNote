import { Prisma } from '@prisma/client';

export const workspaceSnapshot =
  Prisma.validator<Prisma.WorkspaceFindFirstArgs>()({
    select: {
      id: true,
      userId: true,
      name: true,
      icon: true,
      color: true,
      linkAccessLevel: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      workspaceArtifacts: {
        select: {
          artifactId: true,
        },
      },
      workspaceThreads: {
        select: {
          threadId: true,
        },
      },
      workspaceShares: {
        select: {
          userId: true,
          accessLevel: true,
        },
      },
    },
  });

export type PrismaWorkspaceSnapshot = Prisma.WorkspaceGetPayload<
  typeof workspaceSnapshot
>;
