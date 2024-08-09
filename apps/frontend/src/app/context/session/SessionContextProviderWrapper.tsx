import { ReactNode, useEffect, useMemo, useState } from 'react';
import { SessionContext } from './SessionContext';
import { appIdbStorageManager } from '../../../utils/AppIdbStorageManager';
import type { SessionDTO } from '@feynote/shared-utils';

interface Props {
  children: ReactNode;
}

export const SessionContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const [session, setSession] = useState<SessionDTO | null>(null);

  useEffect(() => {
    appIdbStorageManager.getSession().then((session) => {
      setSession(session);
    });
  }, []);

  const setAndPersistSession = async (newSession: SessionDTO | null) => {
    await appIdbStorageManager.deleteAllData();

    if (newSession) {
      await appIdbStorageManager.setSession(newSession);
    } else {
      await appIdbStorageManager.removeSession();
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
