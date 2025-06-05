import { WebsocketMessageEvent } from '@feynote/global-types';

export enum EventName {
  ArtifactUpdated = WebsocketMessageEvent.ArtifactUpdated,
  JobCompleted = WebsocketMessageEvent.JobCompleted,
  ThreadUpdated = WebsocketMessageEvent.ThreadUpdated,
  WebsocketError = 'websocket.error',
  WebsocketReconnect = 'websocket.reconnect',
}
