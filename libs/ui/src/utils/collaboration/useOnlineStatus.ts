import { useEffect, useReducer, useState } from 'react';
import {
  CollaborationManagerEventName,
  getCollaborationManager,
} from './collaborationManager';

export const useOnlineStatus = () => {
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState(
    getCollaborationManager().getWSInstance().status,
  );
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const onlineListener = () => {
      setOnlineStatus(true);
    };
    const offlineListener = () => {
      setOnlineStatus(false);
    };

    window.addEventListener('online', onlineListener);
    window.addEventListener('offline', offlineListener);

    return () => {
      window.removeEventListener('online', onlineListener);
      window.removeEventListener('offline', offlineListener);
    };
  }, []);

  useEffect(() => {
    const wsInstance = getCollaborationManager().getWSInstance();

    const listener = () => {
      setConnectionStatus(wsInstance.status);
    };

    const wsEvents = ['status', 'open', 'connect', 'disconnect'];
    for (const eventName of wsEvents) {
      wsInstance.on(eventName, listener);
    }

    return () => {
      for (const eventName of wsEvents) {
        wsInstance.off(eventName, listener);
      }
    };
  }, [_rerenderReducerValue]);

  useEffect(() => {
    const collaborationManager = getCollaborationManager();
    collaborationManager.on(
      CollaborationManagerEventName.NewWSInstance,
      triggerRerender,
    );

    return () => {
      collaborationManager.off(
        CollaborationManagerEventName.NewWSInstance,
        triggerRerender,
      );
    };
  }, []);

  return {
    onlineStatus,
    connectionStatus,
  };
};
