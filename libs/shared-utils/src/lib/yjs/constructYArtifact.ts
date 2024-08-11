import { Doc as YDoc, Map as YMap } from 'yjs';
import { ARTIFACT_META_KEY } from '../ARTIFACT_META_KEY';
import { YArtifactMetaSchema } from './YArtifactMetaSchema';
import { DEFAULT_CALENDAR_CONFIG } from '../calendar/DEFAULT_CALENDAR_CONFIG';

export const constructYArtifact = (meta: YArtifactMetaSchema) => {
  const yArtifact = new YDoc();

  const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY);

  artifactMetaYMap.set('title', meta.title);
  artifactMetaYMap.set('theme', meta.theme);
  artifactMetaYMap.set('type', meta.type);

  switch (meta.type) {
    case 'tiptap': {
      // No setup steps currently required for a tiptap artifact
      break;
    }
    case 'calendar': {
      const calendarMap = yArtifact.getMap('calendar');
      const configMap = new YMap();
      calendarMap.set('config', configMap);
      for (const [key, value] of Object.entries(DEFAULT_CALENDAR_CONFIG)) {
        configMap.set(key, value);
      }
      break;
    }
  }

  return yArtifact;
};
