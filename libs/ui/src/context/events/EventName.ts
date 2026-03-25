import { WebsocketMessageEvent } from '@feynote/global-types';

/**
 * Global events that can occur in the app.
 * Consider whether your event is truly something that needs to be broadcast globally
 * before deciding to add it here.
 */
export enum EventName {
  ArtifactUpdated = WebsocketMessageEvent.ArtifactUpdated,
  ThreadUpdated = WebsocketMessageEvent.ThreadUpdated,
  WorkspaceUpdated = WebsocketMessageEvent.WorkspaceUpdated,

  // lint-locales-disable
  WebsocketError = 'websocket.error',
  WebsocketReconnect = 'websocket.reconnect',
  WebsocketStatusChanged = 'websocket.statusChanged',

  LocaldbSessionUpdated = 'localdb.sessionUpdated',
  LocaldbEdgesUpdated = 'localdb.edgesUpdated',
  LocaldbSyncArtifact = 'localdb.syncArtifact',
  LocaldbSyncCompleted = 'localdb.syncCompleted',
  LocaldbArtifactSnapshotUpdated = 'localdb.artifactSnapshotUpdated',
  LocaldbWorkspaceSnapshotUpdated = 'localdb.workspaceSnapshotUpdated',
  LocaldbKnownUsersUpdated = 'localdb.knownUsersUpdated',
  LocaldbIDBError = 'localdb.idbError',
  LocaldbPendingFileUploadFailed = 'localdb.pendingFileUploadFailed',

  ArtifactWelcomeCreated = 'artifact.welcomeCreated',

  NavigatorOnline = 'navigator.online',
  NavigatorOffline = 'navigator.offline',
  NavigatorVisible = 'navigator.visible',
  NavigatorHidden = 'navigator.hidden',
  // lint-locales-enable
}
