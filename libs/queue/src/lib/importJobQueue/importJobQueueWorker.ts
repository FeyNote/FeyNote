import { Worker } from 'bullmq';

import { IMPORT_JOB_QUEUE_NAME } from './IMPORT_JOB_QUEUE_NAME';
import { ImportJobQueueItem } from './ImportJobQueueItem';
import { globalServerConfig } from '@feynote/config';
import { ImportJobType } from '@prisma/client';
import { importContentFromObsidian } from './importContentFromObsidian';

export const importJobQueueWorker = new Worker<ImportJobQueueItem, void>(
  IMPORT_JOB_QUEUE_NAME,
  async (args) => {
    console.log(`Received job: ${args.data}`);
    switch (args.data.type) {
      case ImportJobType.Obsidian:
        importContentFromObsidian(args.data);
        break;
      default:
        throw new Error(
          `Invalid job type provided by queue worker: ${args.data}`,
        );
    }
  },
  {
    autorun: false,
    connection: {
      host: globalServerConfig.worker.redis.host,
      port: globalServerConfig.worker.redis.port,
    },
    removeOnComplete: { count: globalServerConfig.worker.queueCompleteCount },
    removeOnFail: { count: globalServerConfig.worker.queueFailCount },
    concurrency: globalServerConfig.worker.queueConcurrency,
  },
);
