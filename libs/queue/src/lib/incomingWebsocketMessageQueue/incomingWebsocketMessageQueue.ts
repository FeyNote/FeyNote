import { Queue } from 'bullmq';
import { INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME } from './INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME';
import { IncomingWebsocketMessageQueueItem } from './IncomingWebsocketMessageQueueItem';
import { globalServerConfig } from '@feynote/config';

export const incomingWebsocketMessageQueue = new Queue<
  IncomingWebsocketMessageQueueItem,
  void
>(INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME, {
  connection: {
    host: globalServerConfig.websocket.redis.host,
    port: globalServerConfig.websocket.redis.port,
  },
  prefix: globalServerConfig.websocket.redis.keyPrefix,
});

export const enqueueIncomingWebsocketMessage = (
  item: IncomingWebsocketMessageQueueItem,
) => {
  return incomingWebsocketMessageQueue.add(
    `${Date.now()}-${Math.random()}`,
    item,
  );
};
