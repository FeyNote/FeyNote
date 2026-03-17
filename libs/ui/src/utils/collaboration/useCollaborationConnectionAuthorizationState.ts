import {
  CollaborationManagerConnection,
  CollaborationManagerConnectionEventName,
} from './collaborationManager';
import { useEffect, useReducer } from 'react';

export const useCollaborationConnectionAuthorizationState = (
  connection: CollaborationManagerConnection,
) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const listener = () => {
      triggerRerender();
    };

    connection.on(
      CollaborationManagerConnectionEventName.AuthorizationStateChange,
      listener,
    );
    connection.indexeddbProvider.on('synced', listener);

    return () => {
      connection.off(
        CollaborationManagerConnectionEventName.AuthorizationStateChange,
        listener,
      );
      connection.indexeddbProvider.off('synced', listener);
    };
  }, [connection]);

  return {
    authorizationState: connection.authorizationState,
    idbSynced: connection.indexeddbProvider.synced,
  };
};
