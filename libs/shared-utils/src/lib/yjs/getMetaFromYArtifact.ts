import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from './ARTIFACT_META_KEY';
import type { YArtifactMeta } from '@feynote/global-types';
import type { TypedMap } from './TypedMap';

export const getMetaFromYArtifact = (yArtifact: YDoc) => {
  const artifactMetaYMap = yArtifact.getMap(
    ARTIFACT_META_KEY,
  ) as TypedMap<YArtifactMeta>;

  let deletedAt = artifactMetaYMap.get('deletedAt');
  if (typeof deletedAt === 'string') {
    // WARN: Legacy support -- we should consider migrating once all clients are updated.
    deletedAt = new Date(deletedAt).getTime();
  }

  const artifactMeta = {
    id: artifactMetaYMap.get('id') ?? undefined,
    userId: artifactMetaYMap.get('userId') ?? undefined,
    title: artifactMetaYMap.get('title') ?? '',
    theme: artifactMetaYMap.get('theme') ?? 'default',
    type: artifactMetaYMap.get('type') ?? 'tiptap',
    linkAccessLevel: artifactMetaYMap.get('linkAccessLevel') ?? 'noaccess',
    createdAt: artifactMetaYMap.get('createdAt') ?? new Date().getTime(),
    deletedAt: deletedAt ?? null,
  } satisfies Partial<YArtifactMeta>;

  return artifactMeta;
};
