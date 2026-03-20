import { useEffect, useReducer } from 'react';
import type { TypedArray } from 'yjs-types';
import { Array as YArray } from 'yjs';

export const useObserveYArrayChanges = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yArray: YArray<any> | TypedArray<any>,
) => {
  const [rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const listener = () => triggerRerender();
    yArray.observeDeep(listener);
    return () => {
      yArray.unobserveDeep(listener);
    };
  }, [yArray]);

  return {
    rerenderReducerValue,
  };
};
