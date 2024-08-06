import { YArtifactMetaSchema } from '@feynote/shared-utils';
import { ZodSchema, z } from 'zod';

export const yArtifactMetaSchema = z.object({
  title: z.string(),
  theme: z.enum(['modern', 'fantasy']),
  type: z.enum(['tiptap', 'calendar']),
}) satisfies ZodSchema<YArtifactMetaSchema>;
