import { getEdgeId, Manifest } from '@feynote/shared-utils';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const getManifest = authenticatedProcedure.query(
  async ({ ctx }): Promise<Manifest> => {
    const artifactsPromise = prisma.artifact.findMany({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    const artifactSharesPromise = prisma.artifactShare.findMany({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        artifact: {
          select: {
            id: true,
            updatedAt: true,
          },
        },
      },
    });

    const [artifacts, artifactShares] = await Promise.all([
      artifactsPromise,
      artifactSharesPromise,
    ]);

    const allArtifactIds = artifacts
      .map((artifact) => artifact.id)
      .concat(artifactShares.map((artifactShare) => artifactShare.artifact.id));

    const relationships = await prisma.artifactReference.findMany({
      where: {
        OR: [
          {
            artifactId: {
              in: allArtifactIds,
            },
          },
          {
            targetArtifactId: {
              in: allArtifactIds,
            },
          },
        ],
      },
      select: {
        artifactId: true,
        artifactBlockId: true,
        targetArtifactId: true,
        referenceTargetArtifactId: true,
        targetArtifactBlockId: true,
        targetArtifactDate: true,
        referenceText: true,
        artifact: {
          select: {
            title: true,
          },
        },
      },
    });

    const manifest: Manifest = {
      edges: relationships.map((relationship) => ({
        id: getEdgeId(relationship),
        artifactId: relationship.artifactId,
        artifactBlockId: relationship.artifactBlockId,
        targetArtifactId: relationship.targetArtifactId,
        targetArtifactBlockId: relationship.targetArtifactBlockId,
        targetArtifactDate: relationship.targetArtifactDate,
        referenceText: relationship.referenceText,
        artifactTitle: relationship.artifact.title,
        isBroken: !relationship.referenceTargetArtifactId,
      })),
      artifactVersions: {},
    };

    for (const artifact of artifacts) {
      manifest.artifactVersions[artifact.id] = artifact.updatedAt.getTime();
    }
    for (const artifactShare of artifactShares) {
      manifest.artifactVersions[artifactShare.artifact.id] =
        artifactShare.artifact.updatedAt.getTime();
    }

    return manifest;
  },
);
