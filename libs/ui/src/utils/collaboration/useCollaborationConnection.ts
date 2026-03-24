import { useEffect, useReducer, useRef } from 'react';
import {
  CollaborationManagerEventName,
  getCollaborationManager,
} from './collaborationManager';
import { useSessionContext } from '../../context/session/SessionContext';

/**
 * This hook should be used for _all_ React-based interaction with our connections.
 * It's internal state management is _critical_ to making sure that connections are
 * reserved and released correctly during component lifecycle.
 * MODIFY WITH GREAT CARE
 */
export const useCollaborationConnection = (docName: string) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const { session } = useSessionContext();
  const currentConnection =
    useRef<ReturnType<ReturnType<typeof getCollaborationManager>['get']>>(
      undefined,
    );

  if (!currentConnection.current) {
    currentConnection.current = getCollaborationManager().get(docName, session);
  }

  useEffect(() => {
    // WARN: Cleanup the initially-instantiated collaboration connection when this hook first rendered. This is critical.
    currentConnection.current?.release();

    const connection = getCollaborationManager().get(docName, session);
    currentConnection.current = connection;

    return () => {
      // WARN: Cleanup the existing connection on unmount of the component. This is critical.
      connection.release();
    };
  }, [session, docName, _rerenderReducerValue]);

  useEffect(() => {
    const collaborationManager = getCollaborationManager();
    collaborationManager.on(
      CollaborationManagerEventName.AllDestroy,
      triggerRerender,
    );
    collaborationManager.on(
      CollaborationManagerEventName.CollaborationConnectionInvalidated,
      triggerRerender,
    );

    return () => {
      collaborationManager.off(
        CollaborationManagerEventName.AllDestroy,
        triggerRerender,
      );
      collaborationManager.off(
        CollaborationManagerEventName.CollaborationConnectionInvalidated,
        triggerRerender,
      );
    };
  }, []);

  return currentConnection.current.connection;
};
