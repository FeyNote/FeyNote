import { router as trpcRouter } from '../../trpc';
import { getArtifactById } from './getArtifactById';
import { getArtifacts } from './getArtifacts';
import { searchArtifactBlocks } from './searchArtifactBlocks';
import { searchArtifacts } from './searchArtifacts';
import { searchArtifactTitles } from './searchArtifactTitles';
import { createArtifact } from './createArtifact';
import { getArtifactYBinById } from './getArtifactYBinById';
import { getArtifactEdgesById } from './getArtifactEdgesById';
import { getSafeArtifactId } from './getSafeArtifactId';
import { removeSelfAsCollaborator } from './removeSelfAsCollaborator';
import { getArtifactSnapshots } from './getArtifactSnapshots';
import { getArtifactSnapshotById } from './getArtifactSnapshotById';
import { getArtifactEdges } from './getArtifactEdges';

export const artifactRouter = trpcRouter({
  getArtifactById,
  getArtifactEdges,
  getArtifactEdgesById,
  getArtifactYBinById,
  getSafeArtifactId,
  getArtifacts,
  getArtifactSnapshots,
  getArtifactSnapshotById,
  removeSelfAsCollaborator,
  searchArtifacts,
  searchArtifactTitles,
  searchArtifactBlocks,
  createArtifact,
});
