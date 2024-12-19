import { router as trpcRouter } from '../../trpc';
import { getArtifactById } from './getArtifactById';
import { getArtifacts } from './getArtifacts';
import { searchArtifactBlocks } from './searchArtifactBlocks';
import { searchArtifacts } from './searchArtifacts';
import { searchArtifactTitles } from './searchArtifactTitles';
import { updateArtifact } from './updateArtifact';
import { createArtifact } from './createArtifact';
import { deleteArtifact } from './deleteArtifact';
import { getArtifactYBinById } from './getArtifactYBinById';
import { getArtifactEdgesById } from './getArtifactEdgesById';

export const artifactRouter = trpcRouter({
  getArtifactById,
  getArtifactEdgesById,
  getArtifactYBinById,
  getArtifacts,
  searchArtifacts,
  searchArtifactTitles,
  searchArtifactBlocks,
  updateArtifact,
  createArtifact,
  deleteArtifact,
});
