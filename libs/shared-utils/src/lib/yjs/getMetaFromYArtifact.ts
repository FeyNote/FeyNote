import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from './ARTIFACT_META_KEY';
import type { YArtifactMeta } from '@feynote/global-types';
import type {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import type { TypedMap } from 'yjs-types';

export const getMetaFromYArtifact = (yArtifact: YDoc) => {
  const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY) as TypedMap<
    Partial<YArtifactMeta>
  >;

  let deletedAt = artifactMetaYMap.get('deletedAt');
  if (typeof deletedAt === 'string') {
    // Legacy support -- we should consider migrating once all clients are updated.
    deletedAt = parseInt(deletedAt);
  }

  const artifactMeta = {
    id: (artifactMetaYMap.get('id') as string) ?? undefined,
    userId: (artifactMetaYMap.get('userId') as string) ?? undefined,
    title: (artifactMetaYMap.get('title') as string) ?? '',
    theme: (artifactMetaYMap.get('theme') as ArtifactTheme) ?? 'default',
    type:
      (artifactMetaYMap.get('type') as ArtifactType | undefined) ?? 'tiptap',
    linkAccessLevel:
      (artifactMetaYMap.get('linkAccessLevel') as ArtifactAccessLevel) ??
      'noaccess',
    // We do NOT include updatedAt in the meta -- yjs specifically recommends against
    // this for document size.
    createdAt: artifactMetaYMap.get('createdAt') ?? new Date().getTime(),
    deletedAt: deletedAt ?? null,
  } satisfies Partial<YArtifactMeta>;

  return artifactMeta;
};
