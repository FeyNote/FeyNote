import { WebsocketMessageEvent } from '@feynote/global-types';

export enum EventName {
  ArtifactUpdated = WebsocketMessageEvent.ArtifactUpdated,
  ThreadUpdated = WebsocketMessageEvent.ThreadUpdated,
  WebsocketError = 'websocket.error',
  WebsocketReconnect = 'websocket.reconnect',
}
