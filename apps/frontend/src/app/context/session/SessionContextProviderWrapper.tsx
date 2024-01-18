import { ReactNode, useCallback, useMemo, useState } from 'react';
import { SessionContext } from './SessionContext';
import { SESSION_ITEM_NAME } from './types';

interface Props {
  children: ReactNode;
}

export const SessionContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const [session, setSession] = useState(
    localStorage.getItem(SESSION_ITEM_NAME)
  );

  const setAndPersistSession = useCallback(
    (newSession: string | null) => {
      if (newSession) {
        localStorage.setItem(SESSION_ITEM_NAME, newSession);
      } else {
        localStorage.removeItem(SESSION_ITEM_NAME);
      }
      setSession(newSession);
    },
    [setSession]
  );

  const value = useMemo(() => {
    return { session, setSession: setAndPersistSession };
  }, [session, setAndPersistSession]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
