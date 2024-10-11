import type {
  WebsocketMessageEvent,
  WebsocketMessageJSON,
} from '@feynote/prisma/types';

export interface OutgoingWebsocketMessageQueueItem {
  room: string;
  event: WebsocketMessageEvent;
  json: string;
}

export interface OutgoingWebsocketMessage<T extends WebsocketMessageEvent> {
  room: string;
  event: T;
  json: WebsocketMessageJSON[T];
}
