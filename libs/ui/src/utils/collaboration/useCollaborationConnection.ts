import { useEffect, useRef } from 'react';
import { collaborationManager } from './collaborationManager';
import { useSessionContext } from '../../context/session/SessionContext';

/**
 * This hook should be used for _all_ React-based interaction with our connections.
 * It's internal state management is _critical_ to making sure that connections are
 * reserved and released correctly during component lifecycle.
 * MODIFY WITH GREAT CARE
 */
export const useCollaborationConnection = (docName: string) => {
  const { session } = useSessionContext();
  const currentConnection =
    useRef<ReturnType<typeof collaborationManager.get>>(undefined);

  if (!currentConnection.current) {
    currentConnection.current = collaborationManager.get(docName, session);
  }

  useEffect(() => {
    // WARN: Cleanup the initially-instantiated collaboration connection when this hook first rendered. This is critical.
    currentConnection.current?.release();

    const connection = collaborationManager.get(docName, session);
    currentConnection.current = connection;

    return () => {
      // WARN: Cleanup the existing connection on unmount of the component. This is critical.
      connection.release();
    };
  }, [session, docName]);

  return currentConnection.current.connection;
};
