import { WebsocketMessageEvent } from '@feynote/global-types';

export enum EventName {
  ArtifactUpdated = WebsocketMessageEvent.ArtifactUpdated,
  ThreadUpdated = WebsocketMessageEvent.ThreadUpdated,
  WorkspaceUpdated = WebsocketMessageEvent.WorkspaceUpdated,

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

  ArtifactWelcomeCreated = 'artifact.welcomeCreated',

  AppOnline = 'app.online',
  AppVisible = 'app.visible',
}
