import { router as trpcRouter } from '../../trpc';
import { getArtifactById } from './getArtifactById';
import { getArtifacts } from './getArtifacts';
import { searchArtifactBlocks } from './searchArtifactBlocks';
import { searchArtifacts } from './searchArtifacts';
import { updateArtifact } from './updateArtifact';
import { createArtifact } from './createArtifact';
import { deleteArtifact } from './deleteArtifact';
import { getArtifactReferenceDisplayTexts } from './getArtifactReferenceDisplayTexts';
import { getArtifactBlockReferenceDisplayTexts } from './getArtifactBlockReferenceDisplayTexts';

export const router = trpcRouter({
  getArtifactById,
  getArtifacts,
  searchArtifacts,
  searchArtifactBlocks,
  updateArtifact,
  createArtifact,
  deleteArtifact,
  getArtifactReferenceDisplayTexts,
  getArtifactBlockReferenceDisplayTexts,
});
