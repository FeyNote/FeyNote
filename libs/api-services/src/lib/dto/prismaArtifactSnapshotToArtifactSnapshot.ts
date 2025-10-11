import type { ArtifactSnapshot } from '@feynote/global-types';
import type { PrismaArtifactSnapshot } from '@feynote/prisma/types';

export const prismaArtifactSnapshotToArtifactSnapshot = (
  prismaShape: PrismaArtifactSnapshot,
): ArtifactSnapshot => {
  return {
    id: prismaShape.id,
    meta: {
      id: prismaShape.id,
      title: prismaShape.title,
      userId: prismaShape.userId,
      theme: prismaShape.theme,
      type: prismaShape.type,
      linkAccessLevel: prismaShape.linkAccessLevel,
      deletedAt: prismaShape.deletedAt?.getTime() || null,
      createdAt: prismaShape.createdAt.getTime(),
    },
    userAccess: prismaShape.artifactShares.map((el) => ({
      key: el.userId,
      val: {
        accessLevel: el.accessLevel,
      },
    })),
    updatedAt: prismaShape.updatedAt.getTime(),
    // Since this is coming from Prisma, there is no world (currently) in which this can be anything
    // but false (since Prisma means that the server knows about the artifact)
    createdLocally: false,
  };
};
