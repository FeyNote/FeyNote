import { WebsocketMessageEvent } from '@feynote/global-types';

export enum EventName {
  ArtifactDeleted = WebsocketMessageEvent.ArtifactDeleted,
  ArtifactUpdated = WebsocketMessageEvent.ArtifactUpdated,
  JobCompleted = WebsocketMessageEvent.JobCompleted,
  WebsocketError = 'websocket.error',
  WebsocketReconnect = 'websocket.reconnect',
}
