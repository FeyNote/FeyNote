import { WebsocketMessageEvent } from '@feynote/global-types';

export enum EventName {
  ArtifactUpdated = WebsocketMessageEvent.ArtifactUpdated,
  ThreadUpdated = WebsocketMessageEvent.ThreadUpdated,

  WebsocketError = 'websocket.error',
  WebsocketReconnect = 'websocket.reconnect',
  WebsocketStatusChanged = 'websocket.statusChanged',

  LocaldbSessionUpdated = 'localdb.sessionUpdated',
  LocaldbEdgesUpdated = 'localdb.edgesUpdated',
  LocaldbSyncArtifact = 'localdb.syncArtifact',
  LocaldbSyncCompleted = 'localdb.syncCompleted',
  LocaldbArtifactSnapshotUpdated = 'localdb.artifactSnapshotUpdated',
  LocaldbKnownUsersUpdated = 'localdb.knownUsersUpdated',

  ArtifactWelcomeCreated = 'artifact.welcomeCreated',
}
