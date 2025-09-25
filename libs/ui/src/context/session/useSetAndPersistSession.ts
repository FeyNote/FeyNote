import { appIdbStorageManager } from '../../utils/AppIdbStorageManager';
import { useGlobalPaneContext } from '../globalPane/GlobalPaneContext';
import { SessionDTO } from '@feynote/shared-utils';

export const useSetAndPersistSession = () => {
  const { resetLayout } = useGlobalPaneContext();

  const setAndPersistSession = async (newSession: SessionDTO | null) => {
    if (newSession) {
      // We only want to purge data if we're switching users, otherwise
      // we might lose unsynced offline changes where the user just needs to log back in
      // due to session timeout.
      const lastSessionUserId =
        await appIdbStorageManager.getLastSessionUserId();
      if (lastSessionUserId !== newSession.userId) {
        await appIdbStorageManager.deleteAllData();
      }

      await appIdbStorageManager.setSession(newSession);
    } else {
      await appIdbStorageManager.removeSession();
    }

    if (resetLayout && newSession) resetLayout();
  };

  return { setAndPersistSession };
};
