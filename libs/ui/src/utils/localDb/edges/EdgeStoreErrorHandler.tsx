import { useEffect } from 'react';
import { useHandleTRPCErrors } from '../../useHandleTRPCErrors';
import { getEdgeStore } from './edgeStore';

/**
 * A tiny component that should be rendered once per app to render errors
 * produced by the store.
 */
export const EdgeStoreErrorHandler: React.FC = () => {
  const edgeStore = getEdgeStore();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  useEffect(() => {
    return edgeStore.listenForFetchFailure(handleTRPCErrors);
  }, [handleTRPCErrors]);

  return null;
};
