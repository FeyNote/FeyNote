import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from './ARTIFACT_META_KEY';
import type { YArtifactMeta, YArtifactUserAccess } from '@feynote/global-types';
import type { TypedMap } from 'yjs-types';
import { getUserAccessFromYArtifact } from './getUserAccessFromYArtifact';

type Input = Omit<YArtifactMeta, 'createdAt'> & {
  createdAt?: YArtifactMeta['createdAt'];
};

export const constructYArtifact = (
  meta: Input,
  userAccess?: Array<{
    key: string;
    val: YArtifactUserAccess;
  }>,
) => {
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
    artifactMetaYMap.set('createdAt', meta.createdAt || new Date().getTime());
    console.log(
      'setting artifact deletedAt during construction',
      meta.deletedAt,
    );
    artifactMetaYMap.set('deletedAt', meta.deletedAt);

    if (userAccess) {
      const userAccessYKV = getUserAccessFromYArtifact(yArtifact);

      for (const { key, val } of userAccess) {
        userAccessYKV.set(key, val);
      }
    }
  });

  return yArtifact;
};
