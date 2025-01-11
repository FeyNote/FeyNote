import { Map as YMap } from 'yjs';
import type { ArtifactCollectionAccessLevel } from '@prisma/client';

export interface YArtifactCollectionMeta {
  id: string;
  title: string;
  linkAccessLevel: ArtifactCollectionAccessLevel | undefined;
  userAccess: YMap<{
    accessLevel: ArtifactCollectionAccessLevel;
  }>;
}
