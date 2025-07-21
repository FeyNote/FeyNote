import { Extension, Server } from '@hocuspocus/server';
import { Logger } from '@hocuspocus/extension-logger';
import { Throttle } from '@hocuspocus/extension-throttle';
import { Redis } from '@hocuspocus/extension-redis';

import { globalServerConfig } from '@feynote/config';
import { onStoreDocument } from './onStoreDocument';
import { onLoadDocument } from './onLoadDocument';
import { beforeHandleMessage } from './beforeHandleMessage';
import { onAuthenticate } from './onAuthenticate';
import { onConnect } from './onConnect';
import { onDisconnect } from './onDisconnect';
import { logger } from '@feynote/api-services';

const extensions: Extension[] = [];

if (globalServerConfig.hocuspocus.throttle.enable) {
  extensions.push(
    new Throttle({
      throttle:
        globalServerConfig.hocuspocus.throttle.connectionsPerMinuteBeforeBan,
      banTime: globalServerConfig.hocuspocus.throttle.banTimeMinutes,
    }),
  );
}

extensions.push(
  new Redis({
    host: globalServerConfig.hocuspocus.redis.host,
    port: globalServerConfig.hocuspocus.redis.port,
  }),
);

extensions.push(
  new Logger({
    log: (message) => {
      logger.info(message);
    },
  }),
);

export const hocuspocusServer = new Server({
  stopOnSignals: true, // Listen to SIGINT, SIGTERM
  port: globalServerConfig.hocuspocus.wsPort,
  debounce: globalServerConfig.hocuspocus.writeDelayMs,
  maxDebounce: globalServerConfig.hocuspocus.maxWriteDelayMs,
  timeout: globalServerConfig.hocuspocus.connectionTimeout,
  onConnect,
  onDisconnect,
  onAuthenticate,
  beforeHandleMessage,
  onLoadDocument,
  onStoreDocument,
  extensions,
});
