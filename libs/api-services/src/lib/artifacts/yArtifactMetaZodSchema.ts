import type { YArtifactMeta } from '@feynote/prisma/types';
import { ArtifactTheme, ArtifactType } from '@prisma/client';
import { ZodSchema, z } from 'zod';

export const yArtifactMetaZodSchema = z.object({
  title: z.string(),
  theme: z.nativeEnum(ArtifactTheme),
  type: z.nativeEnum(ArtifactType),
  titleBodyMerge: z.boolean(),
}) satisfies ZodSchema<YArtifactMeta>;
