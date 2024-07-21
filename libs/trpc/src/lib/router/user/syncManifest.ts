import { Manifest } from '@feynote/shared-utils';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const syncManifest = authenticatedProcedure.query(async ({ ctx }) => {
  const artifactsPromise = prisma.artifact.findMany({
    where: {
      userId: ctx.session.userId,
    },
    select: {
      id: true,
      syncVersion: true,
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
          syncVersion: true,
        }
      }
    },
  });

  const [
    artifacts,
    artifactShares,
  ] = await Promise.all([
    artifactsPromise,
    artifactSharesPromise,
  ]);

  const allArtifactIds = artifacts.map((artifact) => artifact.id).concat(artifactShares.map((artifactShare) => artifactShare.artifact.id));

  const relationships = await prisma.artifactReference.findMany({
    where: {
      artifactId: {
        in: allArtifactIds,
      },
      targetArtifactId: {
        in: allArtifactIds,
      },
    },
    select: {
      artifactId: true,
      artifactBlockId: true,
      targetArtifactId: true,
      targetArtifactBlockId: true,
      referenceText: true,
    },
  });

  const manifest: Manifest = {
    edges: relationships,
    artifactVersions: {},
  };

  for (const artifact of artifacts) {
    manifest.artifactVersions[artifact.id] = artifact.syncVersion;
  }
  for (const artifactShare of artifactShares) {
    manifest.artifactVersions[artifactShare.artifact.id] = artifactShare.artifact.syncVersion;
  }

  return manifest;
});
