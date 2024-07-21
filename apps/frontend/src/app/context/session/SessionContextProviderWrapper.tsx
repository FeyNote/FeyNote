import { ReactNode, useMemo, useState } from 'react';
import { SessionContext } from './SessionContext';
import { SESSION_ITEM_NAME } from './types';
import { Token } from '@feynote/shared-utils';

interface Props {
  children: ReactNode;
}

export const SessionContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const [session, setSession] = useState(
    JSON.parse(localStorage.getItem(SESSION_ITEM_NAME) || "null") as Token | null
  );

  const setAndPersistSession = (newSession: Token | null) => {
    if (newSession) {
      localStorage.setItem(SESSION_ITEM_NAME, JSON.stringify(newSession));
    } else {
      localStorage.removeItem(SESSION_ITEM_NAME);
    }
    setSession(newSession);
  };

  const value = useMemo(() => {
    return { session, setSession: setAndPersistSession };
  }, [session]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
