import { useEffect, useMemo, useReducer } from 'react';
import { getEdgeStore } from './edgeStore';

export const useEdgesForArtifactId = (artifactId: string | undefined) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const edgeStore = getEdgeStore();

  useEffect(() => {
    if (!artifactId) return;

    return edgeStore.listenForArtifactId(artifactId, triggerRerender);
  }, [artifactId]);

  const value = useMemo(() => {
    if (!artifactId) {
      return {
        incomingEdges: [],
        outgoingEdges: [],
        getEdge: () => undefined,
      };
    }

    const { incomingEdges, outgoingEdges } =
      edgeStore.getEdgesForArtifactId(artifactId);

    return {
      incomingEdges,
      outgoingEdges,
      /**
       * Please make sure to memoize the returned value from this function
       * if you call it attached to render
       */
      getEdge: (...args: Parameters<typeof edgeStore.getEdge>) => {
        return edgeStore.getEdge(...args);
      },
    };
  }, [_rerenderReducerValue]);

  return value;
};
