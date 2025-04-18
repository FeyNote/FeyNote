import type { ArtifactTheme, ArtifactType } from '@prisma/client';
import { trpc } from './trpc';

export const createArtifact = async (opts: {
  title: string;
  type?: ArtifactType;
  theme?: ArtifactTheme;
  yBin?: Uint8Array;
}) => {
  // In preparation for local-first artifact creation
  const { id } = await trpc.artifact.getSafeArtifactId.query();

  const result = await trpc.artifact.createArtifact.mutate({
    id,
    title: opts.title,
    type: opts.type || 'tiptap',
    theme: opts.theme || 'default',
    yBin: opts.yBin,
  });

  return result;
};
