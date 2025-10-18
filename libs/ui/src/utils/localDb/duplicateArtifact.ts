import { getMetaFromYArtifact } from '@feynote/shared-utils';
import { Doc as YDoc } from 'yjs';
import { cloneArtifact } from './cloneArtifact';
import { createArtifact } from './createArtifact';
import { t } from 'i18next';

export const duplicateArtifact = async (yjsDoc: YDoc) => {
  const { title } = getMetaFromYArtifact(yjsDoc);

  const newTitle = t('artifact.duplicateTitle', { title });

  const { id, newYDoc } = await cloneArtifact({
    title: newTitle,
    y: yjsDoc,
  });

  const result = await createArtifact({
    artifact: {
      id,
      y: newYDoc,
    },
  });

  return result.id;
};
