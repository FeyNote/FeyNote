import {
  artifactUpdateQueueWorker,
  workspaceUpdateQueueWorker,
  jobQueueWorker,
} from '@feynote/queue';
import { setupMinimalMetricsServer } from '@feynote/api-services';
import './instrument.ts';

import { globalServerConfig } from '@feynote/config';

if (globalServerConfig.worker.enable.artifactUpdate) {
  artifactUpdateQueueWorker.run();
}
if (globalServerConfig.worker.enable.workspaceUpdate) {
  workspaceUpdateQueueWorker.run();
}
if (globalServerConfig.worker.enable.job) {
  jobQueueWorker.run();
}

setupMinimalMetricsServer({
  port: globalServerConfig.worker.restPort,
});

const shutdown = async () => {
  if (globalServerConfig.worker.enable.artifactUpdate) {
    await artifactUpdateQueueWorker.close();
  }
  if (globalServerConfig.worker.enable.workspaceUpdate) {
    await workspaceUpdateQueueWorker.close();
  }
  if (globalServerConfig.worker.enable.job) {
    await jobQueueWorker.close();
  }

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
