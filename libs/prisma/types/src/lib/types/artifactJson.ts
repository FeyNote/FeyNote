import { z } from 'zod';
import { JSONContent } from '@tiptap/core';

export const artifactJsonSchema = z.object({
  tiptapJSONContent: z.record(z.string(), z.any()).optional(), // We don't want to attempt to validate a tiptap schema
});

export type ArtifactJson = Omit<
  z.infer<typeof artifactJsonSchema>,
  'tiptapJSONContent'
> & {
  tiptapJSONContent?: JSONContent;
};
