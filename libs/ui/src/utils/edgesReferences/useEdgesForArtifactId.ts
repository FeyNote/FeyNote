import { useEffect, useReducer } from 'react';
import { getEdgeStore } from './edgeStore';

export const useEdgesForArtifactId = (artifactId: string | undefined) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const edgeStore = getEdgeStore();

  useEffect(() => {
    if (!artifactId) return;

    return edgeStore.listenForArtifactId(artifactId, triggerRerender);
  }, [artifactId]);

  if (!artifactId) {
    return {
      incomingEdges: [],
      outgoingEdges: [],
      getEdge: () => undefined,
    };
  }

  const { incomingEdges, outgoingEdges, getEdge } =
    edgeStore.getEdgesForArtifactId(artifactId);

  return {
    incomingEdges,
    outgoingEdges,
    getEdge,
  };
};
