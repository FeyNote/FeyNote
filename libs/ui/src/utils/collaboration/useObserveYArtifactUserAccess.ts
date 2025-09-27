import { getUserAccessFromYArtifact } from '@feynote/shared-utils';
import { useEffect, useReducer, useState } from 'react';
import { Doc as YDoc } from 'yjs';

export const useObserveYArtifactUserAccess = (yArtifact: YDoc) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const [userAccessYKV] = useState(() => {
    return getUserAccessFromYArtifact(yArtifact);
  });

  useEffect(() => {
    const listener = () => {
      triggerRerender();
    };

    userAccessYKV.on('change', listener);
    return () => userAccessYKV.off('change', listener);
  }, [yArtifact]);

  return {
    userAccessYKV,
    _rerenderReducerValue,
  };
};
