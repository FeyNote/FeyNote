import { Prisma } from '@prisma/client';

export const artifactDetail = Prisma.validator<Prisma.ArtifactArgs>()({
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
    artfactFiles: {
      select: {
        id: true,
        fileId: true,
        order: true,
        file: {
          select: {
            filename: true,
            storageKey: true,
            mimetype: true,
          },
        },
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
    artifactPins: {
      select: {
        userId: true,
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
