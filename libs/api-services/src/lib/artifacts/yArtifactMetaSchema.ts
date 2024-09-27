import { YArtifactMetaSchema } from '@feynote/shared-utils';
import { ArtifactTheme, ArtifactType } from '@prisma/client';
import { ZodSchema, z } from 'zod';

export const yArtifactMetaSchema = z.object({
  title: z.string(),
  theme: z.nativeEnum(ArtifactTheme),
  type: z.nativeEnum(ArtifactType),
  titleBodyMerge: z.boolean(),
}) satisfies ZodSchema<YArtifactMetaSchema>;
