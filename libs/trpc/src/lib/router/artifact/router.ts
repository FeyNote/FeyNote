import { router as trpcRouter } from '../../trpc';
import { getArtifactById } from './getArtifactById';
import { getArtifacts } from './getArtifacts';
import { searchArtifactBlocks } from './searchArtifactBlocks';
import { searchArtifacts } from './searchArtifacts';
import { updateArtifact } from './updateArtifact';
import { createArtifact } from './createArtifact';
import { deleteArtifact } from './deleteArtifact';

export const router = trpcRouter({
  getArtifactById,
  getArtifacts,
  searchArtifacts,
  searchArtifactBlocks,
  updateArtifact,
  createArtifact,
  deleteArtifact,
});
