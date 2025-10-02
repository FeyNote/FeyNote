import { WebSocketStatus } from '@hocuspocus/provider';
import {
  CollaborationManagerConnection,
  CollaborationManagerConnectionAuthenticationStatus,
  HocuspocusAuthorizedScope,
} from './collaborationManager';
import { useArtifactAccessLevel } from './useArtifactAccessLevel';
import { useCollaborationConnectionStatus } from './useCollaborationConnectionStatus';

/**
 * A helpful enum that converts tiptap/hocuspocus authorizedScope into more meaningful states
 * based on their current authentication status.
 */
export enum CollaborationConnectionAuthorizedScope {
  Failed = 'failed',
  Loading = 'loading',
  NoAccess = 'noAccess',
  CoOwner = 'coOwner',
  ReadWrite = 'readWrite',
  ReadOnly = 'readOnly',
}
export const useCollaborationConnectionAuthorizedScope = (
  connection: CollaborationManagerConnection,
) => {
  const { artifactAccessLevel } = useArtifactAccessLevel(
    connection.yjsDoc,
    connection.session?.userId,
  );

  const collaborationConnectionStatus =
    useCollaborationConnectionStatus(connection);

  const {
    connectionStatus,
    authenticationStatus,
    authorizedScope,
    hocuspocusSynced,
    idbSynced,
    isDestroyed,
  } = collaborationConnectionStatus;

  const authFailed =
    authenticationStatus ===
    CollaborationManagerConnectionAuthenticationStatus.AuthenticationFailed;

  const negotiateAuthorizedScope =
    (): CollaborationConnectionAuthorizedScope => {
      if (isDestroyed) {
        return CollaborationConnectionAuthorizedScope.Failed;
      }

      if (
        authFailed ||
        (artifactAccessLevel === 'noaccess' &&
          // It's important to check if idb is synced here, since before idb is synced we'll see noaccess
          idbSynced)
      ) {
        return CollaborationConnectionAuthorizedScope.NoAccess;
      }

      if (
        (authorizedScope === HocuspocusAuthorizedScope.ReadWrite ||
          connectionStatus !== WebSocketStatus.Connected ||
          !hocuspocusSynced) &&
        idbSynced &&
        artifactAccessLevel === 'coowner'
      ) {
        return CollaborationConnectionAuthorizedScope.CoOwner;
      }

      if (
        (authorizedScope === HocuspocusAuthorizedScope.ReadWrite ||
          connectionStatus !== WebSocketStatus.Connected ||
          !hocuspocusSynced) &&
        idbSynced &&
        artifactAccessLevel === 'readwrite'
      ) {
        return CollaborationConnectionAuthorizedScope.ReadWrite;
      }

      if (
        (authorizedScope === HocuspocusAuthorizedScope.ReadOnly ||
          connectionStatus !== WebSocketStatus.Connected ||
          !hocuspocusSynced) &&
        idbSynced &&
        artifactAccessLevel === 'readonly'
      ) {
        return CollaborationConnectionAuthorizedScope.ReadOnly;
      }

      return CollaborationConnectionAuthorizedScope.Loading;
    };

  return {
    authorizedScope: negotiateAuthorizedScope(),
    /**
     * This is included since many locations that require observing authorizedScope also
     * need connection status and we don't want to setup another set of watchers.
     * Use with care.
     */
    collaborationConnectionStatus,
  };
};
