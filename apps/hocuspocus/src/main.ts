import { Extension, Server } from '@hocuspocus/server';
import { Logger } from '@hocuspocus/extension-logger';
import { Throttle } from '@hocuspocus/extension-throttle';

import { globalServerConfig } from '@feynote/config';
import { onStoreDocument } from './onStoreDocument';
import { onLoadDocument } from './onLoadDocument';
import { beforeHandleMessage } from './beforeHandleMessage';
import { onAuthenticate } from './onAuthenticate';

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

if (globalServerConfig.hocuspocus.logging.enable) {
  extensions.push(new Logger());
}

const server = Server.configure({
  stopOnSignals: true, // Listen to SIGINT, SIGTERM
  debounce: globalServerConfig.hocuspocus.writeDelayMs,
  maxDebounce: globalServerConfig.hocuspocus.maxWriteDelayMs,
  timeout: globalServerConfig.hocuspocus.connectionTimeout,
  onAuthenticate,
  beforeHandleMessage,
  onLoadDocument,
  onStoreDocument,
  extensions,
});

server.listen();
