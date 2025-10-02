import { useEffect } from 'react';
import { useHandleTRPCErrors } from '../../useHandleTRPCErrors';
import { getKnownUserStore } from './knownUserStore';

/**
 * A tiny component that should be rendered once per app to render errors
 * produced by the store.
 */
export const KnownUserStoreErrorHandler: React.FC = () => {
  const knownUserStore = getKnownUserStore();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  useEffect(() => {
    return knownUserStore.listenForFetchFailure(handleTRPCErrors);
  }, [handleTRPCErrors]);

  return null;
};
