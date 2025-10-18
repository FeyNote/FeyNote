import { memo, useMemo, useRef } from 'react';
import { AlertContext, type AlertContextData } from './AlertContext';
import { Alerts, type AlertRefValue } from './Alerts';

const MemoizedAlerts = memo(Alerts);

interface Props {
  children: React.ReactNode;
}

export const AlertContextProvider: React.FC<Props> = (props) => {
  const alertRef = useRef<AlertRefValue>({
    publish: () => {
      // noop
    },
  });

  const value = useMemo(
    () =>
      ({
        showAlert: (data) => {
          alertRef.current.publish(data);
        },
      }) satisfies AlertContextData,
    [],
  );

  return (
    <AlertContext.Provider value={value}>
      {props.children}
      <MemoizedAlerts ref={alertRef} />
    </AlertContext.Provider>
  );
};
