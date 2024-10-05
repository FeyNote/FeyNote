import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { SessionContext, type SessionContextData } from './SessionContext';
import { appIdbStorageManager } from '../../utils/AppIdbStorageManager';
import type { SessionDTO } from '@feynote/shared-utils';
import { Auth } from '../../components/auth/Auth';
import { GlobalPaneContext } from '../globalPane/GlobalPaneContext';

interface Props {
  children: ReactNode;
}

export const SessionContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionDTO | null>(null);
  const { resetLayout } = useContext(GlobalPaneContext);

  useEffect(() => {
    appIdbStorageManager.getSession().then((session) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  const setAndPersistSession = async (newSession: SessionDTO | null) => {
    await appIdbStorageManager.deleteAllData();
    if (resetLayout) resetLayout();

    if (newSession) {
      await appIdbStorageManager.setSession(newSession);
    } else {
      await appIdbStorageManager.removeSession();
    }
    setSession(newSession);
  };

  const value = useMemo(
    () => ({
      session,
      setSession: setAndPersistSession,
    }),
    [session],
  );

  // We wait for the async idb call to finish so we don't flash the register page
  if (loading) {
    return <></>;
  }

  if (!value.session) {
    return (
      <SessionContext.Provider value={value as SessionContextData}>
        <Auth />
      </SessionContext.Provider>
    );
  }

  return (
    <SessionContext.Provider value={value as SessionContextData}>
      {children}
    </SessionContext.Provider>
  );
};
