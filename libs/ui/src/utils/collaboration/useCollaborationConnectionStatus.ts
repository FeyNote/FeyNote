import { WebSocketStatus } from '@hocuspocus/provider';
import {
  CollaborationManagerConnection,
  CollaborationManagerConnectionAuthenticationStatus,
  HocuspocusAuthorizedScope,
} from './collaborationManager';
import { useEffect, useState } from 'react';

/**
 * A helper method for watching the status of a given collaboration connection.
 * It's highly advised to use useCollaborationConnectionAuthorizedScope instead of using these raw values
 * to make decisions, since it considers all of these values and gives you _one unified status_ that
 * you can use to make decisions about what to display.
 */
export const useCollaborationConnectionStatus = (
  connection: CollaborationManagerConnection,
): {
  connectionStatus: WebSocketStatus;
  authenticationStatus: CollaborationManagerConnectionAuthenticationStatus;
  authorizedScope: HocuspocusAuthorizedScope;
  idbSynced: boolean;
  hocuspocusSynced: boolean;
  isDestroyed: boolean;
} => {
  const [isDestroyed, setIsDestroyed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    connection.ws.status,
  );
  const [authenticationStatus, setAuthenticationStatus] = useState(
    connection.authenticationStatus,
  );
  const [authorizedScope, setAuthorizedScope] = useState(
    connection.authorizedScope,
  );
  const [idbSynced, setIdbSynced] = useState(
    connection.indexeddbProvider.synced,
  );
  const [hocuspocusSynced, setHocuspocusSynced] = useState(
    connection.tiptapCollabProvider.synced,
  );

  const listener = () => {
    setIsDestroyed(connection.isDestroyed);
    setConnectionStatus(connection.ws.status);
    setAuthenticationStatus(connection.authenticationStatus);
    setAuthorizedScope(connection.authorizedScope);
    setIdbSynced(connection.indexeddbProvider.synced);
    setHocuspocusSynced(connection.tiptapCollabProvider.synced);
  };

  useEffect(() => {
    const wsEvents = ['status', 'open', 'connect', 'disconnect'];
    for (const eventName of wsEvents) {
      connection.ws.on(eventName, listener);
    }
    const localProviderEvents = ['synced'];
    for (const eventName of localProviderEvents) {
      connection.indexeddbProvider.on(eventName, listener);
    }
    const serverProviderEvents = [
      'status',
      'open',
      'connect',
      'authenticated',
      'authenticationFailed',
      'synced',
      'close',
      'disconnect',
      'destroy',
    ];
    for (const eventName of serverProviderEvents) {
      connection.tiptapCollabProvider.on(eventName, listener);
    }
    const ydocEvents = ['destroy'] as const;
    for (const eventName of ydocEvents) {
      connection.yjsDoc.on(eventName, listener);
    }
    listener();

    return () => {
      for (const eventName of wsEvents) {
        connection.ws.off(eventName, listener);
      }
      for (const eventName of localProviderEvents) {
        connection.indexeddbProvider.off(eventName, listener);
      }
      for (const eventName of serverProviderEvents) {
        connection.tiptapCollabProvider.off(eventName, listener);
      }
      for (const eventName of ydocEvents) {
        connection.yjsDoc.off(eventName, listener);
      }
    };
  }, [connection]);

  /**
   * Connections can never recover from a destroyed state. This is purposeful.
   */
  if (isDestroyed) {
    return {
      connectionStatus: WebSocketStatus.Disconnected,
      authenticationStatus:
        CollaborationManagerConnectionAuthenticationStatus.Unauthenticated,
      authorizedScope: HocuspocusAuthorizedScope.Uninitialized,
      hocuspocusSynced: false,
      idbSynced: false,
      isDestroyed,
    };
  }

  return {
    connectionStatus,
    authenticationStatus,
    authorizedScope,
    hocuspocusSynced,
    idbSynced,
    isDestroyed,
  };
};
