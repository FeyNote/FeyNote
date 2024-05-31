import { z } from 'zod';
import { ArtifactEditorBlock } from '@feynote/blocknote';

export const artifactJsonSchema = z.object({
  blocknoteContent: z.array(z.any()).optional(), // We don't want to attempt to validate a blocknote schema
  blocknoteContentMd: z.string().optional(),
});

export type ArtifactJson = Omit<
  z.infer<typeof artifactJsonSchema>,
  'blocknoteContent'
> & {
  blocknoteContent?: ArtifactEditorBlock[];
};
