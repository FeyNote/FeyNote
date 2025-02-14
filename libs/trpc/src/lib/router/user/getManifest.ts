import { getEdgeId, Manifest } from '@feynote/shared-utils';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { ArtifactAccessLevel } from '@prisma/client';

export const getManifest = authenticatedProcedure.query(
  async ({ ctx }): Promise<Manifest> => {
    const personalArtifactsPromise = prisma.artifact.findMany({
      where: {
        userId: ctx.session.userId,
        artifactCollectionId: null,
      },
      select: {
        id: true,
      },
    });

    const artifactCollectionsPromise = prisma.artifactCollectionShare.findMany({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        computedAccessLevels: true,
      },
    });

    const [personalArtifacts, artifactCollections] = await Promise.all([
      personalArtifactsPromise,
      artifactCollectionsPromise,
    ]);

    const personalArtifactIds = personalArtifacts.map(
      (artifact) => artifact.id,
    );
    const artifactCollectionArtifactIds = artifactCollections.flatMap(
      (artifactCollection) =>
        Object.entries(
          artifactCollection.computedAccessLevels as Record<
            string,
            ArtifactAccessLevel
          >,
        )
          .filter(([_, accessLevel]) => {
            return accessLevel !== ArtifactAccessLevel.noaccess;
          })
          .map(([artifactId]) => {
            return artifactId;
          }),
    );

    const allArtifactIds = [
      ...new Set(personalArtifactIds.concat(artifactCollectionArtifactIds)),
    ];

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

    const artifactVersions = await prisma.artifact.findMany({
      where: {
        id: {
          in: allArtifactIds,
        },
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    for (const artifact of artifactVersions) {
      manifest.artifactVersions[artifact.id] = artifact.updatedAt.getTime();
    }

    return manifest;
  },
);
