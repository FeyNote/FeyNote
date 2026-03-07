import { useEffect, useReducer } from 'react';
import type { YKeyValue } from 'y-utility/y-keyvalue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useObserveYKVChanges = (ykv: YKeyValue<any>) => {
  const [rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const listener = () => triggerRerender();
    ykv.on('change', listener);
    return () => {
      ykv.off('change', listener);
    };
  }, [ykv]);

  return {
    rerenderReducerValue,
  };
};
