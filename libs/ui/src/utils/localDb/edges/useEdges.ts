import { useEffect, useMemo, useReducer } from 'react';
import { getEdgeStore } from './edgeStore';

/**
 * This hook is useful when you want to grab multiple different edges from the store.
 * Use the singular useEdgesForArtifactId hook if you just want one (performance!)
 */
export const useEdges = () => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const edgeStore = getEdgeStore();

  useEffect(() => {
    return edgeStore.listen(triggerRerender);
  }, []);

  return useMemo(
    () => ({
      getEdgesForArtifactId: (
        ...args: Parameters<typeof edgeStore.getEdgesForArtifactId>
      ) => {
        return edgeStore.getEdgesForArtifactId(...args);
      },
    }),
    [_rerenderReducerValue],
  );
};
