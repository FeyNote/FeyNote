import { useEffect, useReducer } from 'react';
import { getEdgeStore } from './edgeStore';

export const useEdges = () => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const edgeStore = getEdgeStore();

  useEffect(() => {
    return edgeStore.listen(triggerRerender);
  }, []);

  return {
    _edgesRerenderReducerValue: _rerenderReducerValue,
    getEdgesForArtifactId: edgeStore.getEdgesForArtifactId,
  };
};
