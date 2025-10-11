import { useEffect, useReducer, useState } from 'react';
import {
  CollaborationManagerEventName,
  getCollaborationManager,
} from './collaborationManager';
import { websocketClient } from '../../context/events/websocketClient';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';

export const useOnlineStatus = () => {
  const getIsServiceWorkerAvailable = () => {
    return navigator.serviceWorker.controller?.state === 'activated';
  };
  const [serviceWorkerIsAvailable, setServiceWorkerIsAvailable] = useState(
    getIsServiceWorkerAvailable(),
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hocuspocusIsConnected, setHocuspocusIsConnected] = useState(
    getCollaborationManager().getWSInstance().status === 'connected',
  );
  const [websocketIsConnected, setWebsocketIsConnected] = useState(
    websocketClient.connected,
  );
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const onlineListener = () => {
      setIsOnline(true);
    };
    const offlineListener = () => {
      setIsOnline(false);
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
      setHocuspocusIsConnected(wsInstance.status === 'connected');
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

  useEffect(() => {
    const listener = () => {
      setServiceWorkerIsAvailable(getIsServiceWorkerAvailable());
    };

    navigator.serviceWorker.addEventListener('controllerchange', listener);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', listener);
    };
  }, []);

  useEffect(() => {
    const listener = () => {
      setWebsocketIsConnected(websocketClient.connected);
    };

    eventManager.addEventListener([EventName.WebsocketStatusChanged], listener);
    return () => {
      eventManager.removeEventListener(
        [EventName.WebsocketStatusChanged],
        listener,
      );
    };
  }, []);

  return {
    isOnline,
    serviceWorkerIsAvailable,
    hocuspocusIsConnected,
    websocketIsConnected,
  };
};
