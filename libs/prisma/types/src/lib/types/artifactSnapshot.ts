import { Prisma } from '@prisma/client';

export const artifactSnapshot =
  Prisma.validator<Prisma.ArtifactFindFirstArgs>()({
    select: {
      id: true,
      title: true,
      type: true,
      theme: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      artifactShares: {
        select: {
          userId: true,
          accessLevel: true,
        },
      },
      linkAccessLevel: true,
    },
  });

export type PrismaArtifactSnapshot = Prisma.ArtifactGetPayload<
  typeof artifactSnapshot
>;
