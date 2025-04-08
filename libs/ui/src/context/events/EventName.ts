import { WebsocketMessageEvent } from '@feynote/global-types';

export enum EventName {
  ArtifactUpdated = WebsocketMessageEvent.ArtifactUpdated,
  JobCompleted = WebsocketMessageEvent.JobCompleted,
  WebsocketError = 'websocket.error',
  WebsocketReconnect = 'websocket.reconnect',
}
