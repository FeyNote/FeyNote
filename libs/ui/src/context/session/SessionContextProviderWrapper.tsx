import { ReactNode, useEffect, useMemo, useState } from 'react';
import { SessionContext, type SessionContextData } from './SessionContext';
import { appIdbStorageManager } from '../../utils/AppIdbStorageManager';
import type { SessionDTO } from '@feynote/shared-utils';
import { Auth } from '../../components/auth/Auth';
import {
  getWelcomeModalPending,
  setWelcomeModalPending,
} from '../../utils/welcomeModalState';
import { useIonModal } from '@ionic/react';
import { WelcomeModal } from '../../components/dashboard/WelcomeModal';
import { useSetAndPersistSession } from './useSetAndPersistSession';

interface Props {
  children: ReactNode;
}

export const SessionContextProviderWrapper: React.FC<Props> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionDTO | null>(null);
  const { setAndPersistSession: _setAndPersistSession } =
    useSetAndPersistSession();
  const [presentWelcomeModal, dismissWelcomeModal] = useIonModal(WelcomeModal, {
    dismiss: () => dismissWelcomeModal(),
  });

  useEffect(() => {
    if (getWelcomeModalPending()) {
      setWelcomeModalPending(false);
      presentWelcomeModal();
    }
  }, [session]);

  useEffect(() => {
    appIdbStorageManager.getSession().then((session) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  const setAndPersistSession = async (newSession: SessionDTO | null) => {
    await _setAndPersistSession(newSession);
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
    return null;
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
