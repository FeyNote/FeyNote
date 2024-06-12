import { ArtifactTheme } from '@prisma/client';
import { z } from 'zod';

export const yArtifactMetaSchema = z.object({
  title: z.string(),
  theme: z.nativeEnum(ArtifactTheme),
  isPinned: z.boolean(),
  isTemplate: z.boolean(),
});
