import { useEffect, useState } from 'react';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import { appIdbStorageManager } from './AppIdbStorageManager';

export const useLastSyncedAt = () => {
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | undefined>();

  useEffect(() => {
    const listener = async () => {
      setLastSyncedAt(await appIdbStorageManager.getLastSyncedAt());
    };

    listener();
    return eventManager.addEventListener(
      EventName.LocaldbSyncCompleted,
      listener,
    );
  }, []);

  return {
    lastSyncedAt,
  };
};
