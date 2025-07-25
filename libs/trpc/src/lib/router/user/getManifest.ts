import { getEdgeId, Manifest, type Edge } from '@feynote/shared-utils';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { ArtifactAccessLevel } from '@prisma/client';

export const getManifest = authenticatedProcedure.query(
  async ({ ctx }): Promise<Manifest> => {
    const artifactsPromise = prisma.artifact.findMany({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        updatedAt: true,
      },
    });

    const artifactSharesPromise = prisma.artifactShare.findMany({
      where: {
        userId: ctx.session.userId,
        accessLevel: {
          not: ArtifactAccessLevel.noaccess,
        },
      },
      select: {
        artifact: {
          select: {
            id: true,
            title: true,
            deletedAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const [artifacts, artifactShares] = await Promise.all([
      artifactsPromise,
      artifactSharesPromise,
    ]);

    const allArtifactsMap = new Map(
      artifacts
        .concat(artifactShares.map((artifactShare) => artifactShare.artifact))
        .map((artifact) => [artifact.id, artifact]),
    );

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
      },
    });

    const edges: Edge[] = [];
    for (const relation of relationships) {
      const artifact = allArtifactsMap.get(relation.artifactId);
      // We do not want to show incoming references from artifacts you do not have access to
      if (!artifact) continue;
      const targetArtifact = allArtifactsMap.get(relation.targetArtifactId);

      // We don't want artifacts that are deleted to show up as pointing to your artifact
      // since that would be annoying -- you'd have to go and remove all references in a deleted artifact
      // to get it to stop showing up as a zombie
      if (artifact.deletedAt) continue;

      edges.push({
        id: getEdgeId(relation),
        artifactId: relation.artifactId,
        artifactBlockId: relation.artifactBlockId,
        targetArtifactId: relation.targetArtifactId,
        targetArtifactBlockId: relation.targetArtifactBlockId,
        targetArtifactDate: relation.targetArtifactDate,
        targetArtifactTitle: targetArtifact?.title || null,
        referenceText: relation.referenceText,
        artifactTitle: artifact.title,
        isBroken: !relation.referenceTargetArtifactId,
      });
    }

    const manifest: Manifest = {
      edges,
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
