import { Queue } from 'bullmq';
import { IMPORT_JOB_QUEUE_NAME } from './IMPORT_JOB_QUEUE_NAME';
import { ImportJobQueueItem } from './ImportJobQueueItem';
import { globalServerConfig } from '@feynote/config';

export const importJobQueue = new Queue<ImportJobQueueItem, void>(
  IMPORT_JOB_QUEUE_NAME,
  {
    connection: {
      host: globalServerConfig.worker.redis.host,
      port: globalServerConfig.worker.redis.port,
    },
  },
);

export const enqueueJobQueueUpdate = (item: ImportJobQueueItem) => {
  return importJobQueue.add(`${Date.now()}-${Math.random()}`, item);
};
