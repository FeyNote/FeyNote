import { prisma } from '@feynote/prisma/client';
import { getEdgeId, type Edge, type Manifest } from '@feynote/shared-utils';
import { ArtifactAccessLevel } from '@prisma/client';

export async function getManifest(userId: string) {
  const artifactsPromise = prisma.artifact.findMany({
    where: {
      userId,
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
      userId,
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

    // TODO: Investigate impacts of this removal. I want to do this frontend-side.
    // We don't want artifacts that are deleted to show up as pointing to your artifact
    // since that would be annoying -- you'd have to go and remove all references in a deleted artifact
    // to get it to stop showing up as a zombie
    // if (artifact.deletedAt) continue;

    edges.push({
      id: getEdgeId(relation),
      artifactId: relation.artifactId,
      artifactBlockId: relation.artifactBlockId,
      artifactDeleted: !!artifact.deletedAt,
      targetArtifactId: relation.targetArtifactId,
      targetArtifactBlockId: relation.targetArtifactBlockId,
      targetArtifactDate: relation.targetArtifactDate,
      targetArtifactTitle: targetArtifact?.title || null,
      // If targetArtifact is not present, that doesn't mean that the targetArtifact is deleted,
      // only that it's not directly shared with the user. The artifact could still exist,
      // and just not be accessible to the user or be shared via linkAccessLevel.
      // We don't have a good way to check if those two scenarios are the case, so we don't mark it
      // as deleted as we're not sure.
      targetArtifactDeleted: !!targetArtifact && !!targetArtifact.deletedAt,
      referenceText: relation.referenceText,
      artifactTitle: artifact.title,
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
}
