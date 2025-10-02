import { useEffect, useReducer } from 'react';
import { getKnownUserStore } from './knownUserStore';

/**
 * Consume a single known user in the store.
 */
export const useKnownUser = (userId: string) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const knownUserStore = getKnownUserStore();

  useEffect(() => {
    return knownUserStore.listenForUserId(userId, triggerRerender);
  }, []);

  return {
    isLoading: knownUserStore.isLoading,
    knownUser: knownUserStore.getKnownUserById(userId),
  };
};
