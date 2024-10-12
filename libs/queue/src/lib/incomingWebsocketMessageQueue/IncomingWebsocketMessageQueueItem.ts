import type { WebsocketMessageEvent } from '@feynote/global-types';

export interface IncomingWebsocketMessageQueueItem {
  userId: string;
  event: WebsocketMessageEvent;
  json: string;
}
