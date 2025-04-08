import { WebsocketMessageEvent } from '@feynote/global-types';

export enum EventName {
  ArtifactUpdated = WebsocketMessageEvent.ArtifactUpdated,

  WebsocketError = 'websocket.error',
  WebsocketReconnect = 'websocket.reconnect',
}
