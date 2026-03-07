import { getUserAccessFromYArtifact } from '@feynote/shared-utils';
import { useState } from 'react';
import { Doc as YDoc } from 'yjs';
import { useObserveYKVChanges } from './useObserveYKVChanges';

export const useObserveYArtifactUserAccess = (yArtifact: YDoc) => {
  const [userAccessYKV] = useState(() => {
    return getUserAccessFromYArtifact(yArtifact);
  });

  const { rerenderReducerValue } = useObserveYKVChanges(userAccessYKV);

  return {
    userAccessYKV,
    rerenderReducerValue,
  };
};
