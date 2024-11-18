import { useContext } from 'react';
import { appIdbStorageManager } from '../../utils/AppIdbStorageManager';
import { GlobalPaneContext } from '../globalPane/GlobalPaneContext';
import { SessionDTO } from '@feynote/shared-utils';

export const useSetAndPersistSession = () => {
  const { resetLayout } = useContext(GlobalPaneContext);

  const setAndPersistSession = async (newSession: SessionDTO | null) => {
    await appIdbStorageManager.deleteAllData();

    if (newSession) {
      await appIdbStorageManager.setSession(newSession);
    } else {
      await appIdbStorageManager.removeSession();
    }

    if (resetLayout && newSession) resetLayout();
  };

  return { setAndPersistSession };
};
