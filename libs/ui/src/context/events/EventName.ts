import { WebsocketMessageEvent } from '@feynote/global-types';

export enum EventName {
  ArtifactDeleted = WebsocketMessageEvent.ArtifactDeleted,
  ArtifactUpdated = WebsocketMessageEvent.ArtifactUpdated,

  WebsocketError = 'websocket.error',
  WebsocketReconnect = 'websocket.reconnect',
}
