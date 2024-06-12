import { YArtifactMetaSchema } from '@feynote/shared-utils';
import { ArtifactTheme } from '@prisma/client';
import { ZodSchema, z } from 'zod';

export const yArtifactMetaSchema = z.object({
  title: z.string(),
  theme: z.nativeEnum(ArtifactTheme),
}) satisfies ZodSchema<YArtifactMetaSchema>;
