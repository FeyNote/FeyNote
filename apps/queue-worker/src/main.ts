import { setupMinimalMetricsServer } from '@feynote/api-services';
import './instrument.ts';

import { artifactUpdateQueueWorker } from '@feynote/queue';
import { globalServerConfig } from '@feynote/config';

artifactUpdateQueueWorker.run();

setupMinimalMetricsServer({
  port: globalServerConfig.worker.restPort,
});

const shutdown = async () => {
  await artifactUpdateQueueWorker.close();

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
