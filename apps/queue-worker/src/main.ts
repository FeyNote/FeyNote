import {
  artifactUpdateQueueWorker,
  workspaceUpdateQueueWorker,
  jobQueueWorker,
} from '@feynote/queue';
import { setupMinimalMetricsServer } from '@feynote/api-services';
import './instrument.ts';

import { globalServerConfig } from '@feynote/config';

artifactUpdateQueueWorker.run();
workspaceUpdateQueueWorker.run();
jobQueueWorker.run();

setupMinimalMetricsServer({
  port: globalServerConfig.worker.restPort,
});

const shutdown = async () => {
  await artifactUpdateQueueWorker.close();
  await workspaceUpdateQueueWorker.close();
  await jobQueueWorker.close();

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
