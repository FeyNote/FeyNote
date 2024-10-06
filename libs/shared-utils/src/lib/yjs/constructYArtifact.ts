import { Doc as YDoc, Map as YMap } from 'yjs';
import { ARTIFACT_META_KEY } from '../ARTIFACT_META_KEY';
import type { YArtifactMeta } from '@feynote/prisma/types';
import { generateGregorianSundayCalendarConfig } from '../calendar/generateGregorianSundayCalendarConfig';

export const constructYArtifact = (meta: YArtifactMeta) => {
  const yArtifact = new YDoc();

  const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY);

  artifactMetaYMap.set('title', meta.title);
  artifactMetaYMap.set('theme', meta.theme);
  artifactMetaYMap.set('type', meta.type);
  artifactMetaYMap.set('titleBodyMerge', meta.titleBodyMerge);

  switch (meta.type) {
    case 'tiptap': {
      // No setup steps currently required for a tiptap artifact
      break;
    }
    case 'calendar': {
      const calendarMap = yArtifact.getMap('calendar');
      const configMap = new YMap();
      calendarMap.set('config', configMap);
      for (const [key, value] of Object.entries(
        generateGregorianSundayCalendarConfig(),
      )) {
        configMap.set(key, value);
      }
      break;
    }
  }

  return yArtifact;
};
