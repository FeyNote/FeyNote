import { z, ZodSchema } from 'zod';
import { yArtifactMetaZodSchema } from './yArtifactMetaZodSchema';
import { ArtifactJSON } from '@feynote/prisma/types';

export const artifactJsonZodSchema = z.object({
  tiptapBody: z.record(z.string(), z.any()).optional(), // We don't want to attempt to validate a tiptap schema
  meta: yArtifactMetaZodSchema,
}) satisfies ZodSchema<ArtifactJSON>;
