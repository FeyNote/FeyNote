import { z } from 'zod';

export const artifactJsonSchema = z.object({
  blocknoteContent: z.array(z.any()).optional(), // We don't want to attempt to validate a blocknote schema
  blocknoteContentMd: z.string().optional(),
});

// blocknoteContent is typed as any rather than overriding because we can't load blocknote react on the server side :(
export type ArtifactJson = z.infer<typeof artifactJsonSchema>;
