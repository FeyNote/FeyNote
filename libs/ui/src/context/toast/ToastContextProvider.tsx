import { memo, useMemo, useRef } from 'react';
import { ToastContext, type ToastContextData } from './ToastContext';
import { Toasts, ToastsRefValue } from './Toasts';

const MemoizedToasts = memo(Toasts);

interface Props {
  children: React.ReactNode;
}

export const ToastContextProvider: React.FC<Props> = (props) => {
  const toastRef = useRef<ToastsRefValue>({
    publish: () => {
      // noop
    },
  });

  const value = useMemo(
    () =>
      ({
        showToast: (toastData) => {
          toastRef.current.publish(toastData);
        },
      }) satisfies ToastContextData,
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {props.children}
      <MemoizedToasts ref={toastRef} />
    </ToastContext.Provider>
  );
};
