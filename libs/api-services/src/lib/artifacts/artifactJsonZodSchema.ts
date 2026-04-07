import { z, ZodSchema } from 'zod';
import { yArtifactMetaZodSchema } from './yArtifactMetaZodSchema';
import { ArtifactJSON } from '@feynote/global-types';

export const artifactJsonZodSchema = z.object({
  meta: yArtifactMetaZodSchema,
}) satisfies ZodSchema<ArtifactJSON>;
