import { Queue } from 'bullmq';
import { JOB_QUEUE_NAME } from './JOB_QUEUE_NAME';
import { JobQueueItem } from './jobQueueItem';
import { globalServerConfig } from '@feynote/config';

export const jobQueue = new Queue<JobQueueItem, void>(JOB_QUEUE_NAME, {
  connection: {
    host: globalServerConfig.worker.redis.host,
    port: globalServerConfig.worker.redis.port,
  },
  prefix: globalServerConfig.worker.redis.keyPrefix,
});

export const enqueueJob = (item: JobQueueItem) => {
  jobQueue.add(`${Date.now()}-${Math.random()}`, item);
};
