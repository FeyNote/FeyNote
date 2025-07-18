import { Queue } from 'bullmq';
import { OUTGOING_WEBSOCKET_MESSAGE_QUEUE_NAME } from './OUTGOING_WEBSOCKET_MESSAGE_QUEUE_NAME';
import {
  OutgoingWebsocketMessage,
  OutgoingWebsocketMessageQueueItem,
} from './OutgoingWebsocketMessageQueueItem';
import { globalServerConfig } from '@feynote/config';
import { WebsocketMessageEvent } from '@feynote/global-types';
import { metrics } from '@feynote/api-services';

export const websocketMessageQueue = new Queue<
  OutgoingWebsocketMessageQueueItem,
  void
>(OUTGOING_WEBSOCKET_MESSAGE_QUEUE_NAME, {
  connection: {
    host: globalServerConfig.websocket.redis.host,
    port: globalServerConfig.websocket.redis.port,
  },
  prefix: globalServerConfig.websocket.redis.keyPrefix,
});

export const enqueueOutgoingWebsocketMessage = <
  T extends WebsocketMessageEvent,
>(
  item: OutgoingWebsocketMessage<T>,
) => {
  metrics.websocketMessageOutgoing.inc({
    message_type: item.event,
  });

  return websocketMessageQueue.add(`${Date.now()}-${Math.random()}`, {
    ...item,
    json: JSON.stringify(item.json),
  });
};

export const wsRoomNameForUserId = (userId: string) => {
  return `userId:${userId}`;
};
