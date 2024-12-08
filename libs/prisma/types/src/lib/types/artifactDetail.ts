import { Prisma } from '@prisma/client';

export const artifactDetail = Prisma.validator<Prisma.ArtifactFindFirstArgs>()({
  select: {
    id: true,
    title: true,
    type: true,
    theme: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    text: true,
    artifactReferences: {
      select: {
        id: true,
        artifactId: true,
        artifactBlockId: true,
        targetArtifactId: true,
        targetArtifactBlockId: true,
        referenceTargetArtifactId: true,
        targetArtifact: {
          select: {
            title: true,
          },
        },
        referenceText: true,
        targetArtifactDate: true,
      },
    },
    incomingArtifactReferences: {
      select: {
        id: true,
        artifactId: true,
        artifact: {
          select: {
            title: true,
          },
        },
        artifactBlockId: true,
        targetArtifactId: true,
        targetArtifactBlockId: true,
        targetArtifactDate: true,
      },
    },
    files: {
      select: {
        id: true,
        name: true,
        storageKey: true,
        mimetype: true,
      },
    },
    artifactShares: {
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            name: true,
          },
        },
        accessLevel: true,
      },
    },
    artifactShareTokens: {
      select: {
        id: true,
        shareToken: true,
        allowAddToAccount: true,
        accessLevel: true,
      },
    },
    user: {
      select: {
        name: true,
      },
    },
  },
});

export type ArtifactDetail = Prisma.ArtifactGetPayload<typeof artifactDetail>;
