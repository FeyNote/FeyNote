import { ARTIFACT_META_KEY, getMetaFromYArtifact } from '@feynote/shared-utils';
import { useMemo } from 'react';
import { Doc as YDoc } from 'yjs';
import { useObserveYMapChanges } from './useObserveYMapChanges';

export const useObserveYArtifactMeta = (yDoc: YDoc) => {
  const metaYMap = useMemo(() => {
    return yDoc.getMap(ARTIFACT_META_KEY);
  }, [yDoc]);

  const { rerenderReducerValue } = useObserveYMapChanges(metaYMap);

  const meta = useMemo(() => {
    return getMetaFromYArtifact(yDoc);
  }, [yDoc, rerenderReducerValue]);

  return {
    meta,
    metaYMap,
  };
};
