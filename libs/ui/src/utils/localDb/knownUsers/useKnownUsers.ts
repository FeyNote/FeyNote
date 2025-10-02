import { useEffect, useMemo, useReducer } from 'react';
import { getKnownUserStore } from './knownUserStore';

export const useKnownUsers = () => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const knownUserStore = getKnownUserStore();

  useEffect(() => {
    return knownUserStore.listen(triggerRerender);
  }, []);

  return useMemo(
    () => ({
      isLoading: knownUserStore.isLoading,
      getKnownUserById: (userId: string) => {
        return knownUserStore.getKnownUserById(userId);
      },
    }),
    [_rerenderReducerValue],
  );
};
