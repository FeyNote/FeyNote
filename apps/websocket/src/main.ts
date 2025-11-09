import './instrument.ts';

import { Server } from 'socket.io';
import { prisma } from '@feynote/prisma/client';
import {
  buildOutgoingWebsocketMessageQueueWorker,
  enqueueIncomingWebsocketMessage,
  wsRoomNameForUserId,
} from '@feynote/queue';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { globalServerConfig } from '@feynote/config';
import {
  logger,
  metrics,
  setupMinimalMetricsServer,
} from '@feynote/api-services';

const pubClient = new Redis({
  host: globalServerConfig.websocket.redis.host,
  port: globalServerConfig.websocket.redis.port,
});
const subClient = pubClient.duplicate();

pubClient.on('error', (err) => {
  logger.error(err);
});
subClient.on('error', (err) => {
  logger.error(err);
});

const io = new Server({
  transports: ['websocket'],
  path: '/',
  adapter: createAdapter(pubClient, subClient),
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    const { userId } = await prisma.session.findFirstOrThrow({
      where: {
        token,
      },
      select: {
        userId: true,
      },
    });

    socket.data.userId = userId;

    next();
  } catch (_e) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId;

  socket.join(wsRoomNameForUserId(userId));

  socket.on('message', (message) => {
    enqueueIncomingWebsocketMessage({
      userId,
      event: message.event,
      json: JSON.stringify(message),
    });
    metrics.websocketMessageIncoming.inc();
  });

  socket.on('disconnect', () => {
    console.log("disconnect");
  });

  metrics.websocketConnection.inc();
  const clientCount = io.of('/').sockets.size;
  metrics.websocketConnectionCount.set(clientCount);
});

io.listen(globalServerConfig.websocket.wsPort);

const worker = buildOutgoingWebsocketMessageQueueWorker(io);

worker.run();

setupMinimalMetricsServer({
  port: globalServerConfig.websocket.restPort,
});

const shutdown = async () => {
  await worker.close();
  await io.close();

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
