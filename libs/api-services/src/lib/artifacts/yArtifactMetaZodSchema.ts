import type { YArtifactMeta } from '@feynote/global-types';
import {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import { ZodSchema, z } from 'zod';

export const yArtifactMetaZodSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  theme: z.nativeEnum(ArtifactTheme),
  type: z.nativeEnum(ArtifactType),
  linkAccessLevel: z.nativeEnum(ArtifactAccessLevel),
  deletedAt: z.number().nullable(),
  createdAt: z.number(),
}) satisfies ZodSchema<YArtifactMeta>;
