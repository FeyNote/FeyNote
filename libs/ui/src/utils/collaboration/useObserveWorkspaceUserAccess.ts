import { getWorkspaceUserAccessFromYDoc } from '@feynote/shared-utils';
import { useState } from 'react';
import { Doc as YDoc } from 'yjs';
import { useObserveYKVChanges } from './useObserveYKVChanges';

export const useObserveWorkspaceUserAccess = (yDoc: YDoc) => {
  const [userAccessYKV] = useState(() => {
    return getWorkspaceUserAccessFromYDoc(yDoc);
  });

  const { rerenderReducerValue } = useObserveYKVChanges(userAccessYKV);

  return {
    userAccessYKV,
    rerenderReducerValue,
  };
};
