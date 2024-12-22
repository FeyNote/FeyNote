import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';

import { CollaborationManagerConnection } from '../components/editor/collaborationManager';
import { appIdbStorageManager } from './AppIdbStorageManager';

export const useIsEditable = (connection: CollaborationManagerConnection) => {
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    let resolved = false;
    connection.authorizedScopePromise.then((scope) => {
      resolved = true;
      setIsEditable(scope === 'read-write');

      appIdbStorageManager.setAuthorizedCollaborationScope(
        connection.docName,
        scope,
      );
    });

    appIdbStorageManager
      .getAuthorizedCollaborationScope(connection.docName)
      .then((scope) => {
        // We defer to the value from the connection itself since that's the source of truth
        // but loading from IDB is fast and should be used to show the user immediate UI
        if (!resolved) {
          setIsEditable(scope === 'read-write');
        }
      })
      .catch((e) => {
        Sentry.captureException(e);
        console.error(e);
      });
  }, []);

  return {
    isEditable,
  };
};
