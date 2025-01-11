import type { YArtifactCollectionMeta } from '@feynote/global-types';
import { ArtifactCollectionAccessLevel } from '@prisma/client';
import { ZodSchema, z } from 'zod';

type MutatedType = Omit<YArtifactCollectionMeta, 'userAccess'> & {
  userAccess?: unknown; // We don't have a good way to enforce this type since it's a Yjs Map
};

export const yArtifactCollectionMetaZodSchema = z.object({
  id: z.string(),
  title: z.string(),
  userAccess: z.unknown(),
  linkAccessLevel: z.nativeEnum(ArtifactCollectionAccessLevel),
}) satisfies ZodSchema<MutatedType>;
