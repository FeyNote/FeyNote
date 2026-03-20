import { useEffect, useReducer } from 'react';
import { Map as YMap } from 'yjs';
import type { TypedMap } from 'yjs-types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useObserveYMapChanges = (yMap: YMap<any> | TypedMap<any>) => {
  const [rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const listener = () => triggerRerender();
    yMap.observeDeep(listener);
    return () => {
      yMap.unobserveDeep(listener);
    };
  }, [yMap]);

  return {
    rerenderReducerValue,
  };
};
