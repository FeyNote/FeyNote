import type { WebsocketMessageEvent } from '@feynote/prisma/types';

export interface IncomingWebsocketMessageQueueItem {
  userId: string;
  event: WebsocketMessageEvent;
  json: string;
}
