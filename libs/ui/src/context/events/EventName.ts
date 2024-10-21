import { WebsocketMessageEvent } from '@feynote/global-types';

export enum EventName {
  ArtifactDeleted = WebsocketMessageEvent.ArtifactDeleted,
  ArtifactUpdated = WebsocketMessageEvent.ArtifactUpdated,
  ArtifactPinChanged = WebsocketMessageEvent.ArtifactPinChanged,

  WebsocketError = 'websocket.error',
  WebsocketReconnect = 'websocket.reconnect',
}
