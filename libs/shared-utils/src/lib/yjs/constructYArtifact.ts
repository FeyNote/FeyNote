import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from './ARTIFACT_META_KEY';
import type { YArtifactMeta } from '@feynote/global-types';
import { ARTIFACT_USER_ACCESS_KEY } from './ARTIFACT_USER_ACCESS_KEY';
import type { TypedMap } from 'yjs-types';

type Input = Omit<YArtifactMeta, 'createdAt'> & {
  createdAt?: YArtifactMeta['createdAt'];
};

export const constructYArtifact = (meta: Input) => {
  const yArtifact = new YDoc();

  yArtifact.transact(() => {
    const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY) as TypedMap<
      Partial<YArtifactMeta>
    >;

    artifactMetaYMap.set('id', meta.id);
    artifactMetaYMap.set('userId', meta.userId);
    artifactMetaYMap.set('title', meta.title);
    artifactMetaYMap.set('theme', meta.theme);
    artifactMetaYMap.set('type', meta.type);
    artifactMetaYMap.set('linkAccessLevel', meta.linkAccessLevel);
    artifactMetaYMap.set(
      'createdAt',
      meta.createdAt || new Date().getTime().toString(),
    );
    artifactMetaYMap.set('deletedAt', meta.deletedAt);

    yArtifact.getArray(ARTIFACT_USER_ACCESS_KEY);
  });

  return yArtifact;
};
