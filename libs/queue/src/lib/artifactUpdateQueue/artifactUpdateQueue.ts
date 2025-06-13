import { Queue } from 'bullmq';
import { ARTIFACT_UPDATE_QUEUE_NAME } from './ARTIFACT_UPDATE_QUEUE_NAME';
import { ArtifactUpdateQueueItem } from './ArtifactUpdateQueueItem';
import { globalServerConfig } from '@feynote/config';
import { metrics } from '@feynote/api-services';

export const artifactUpdateQueue = new Queue<ArtifactUpdateQueueItem, void>(
  ARTIFACT_UPDATE_QUEUE_NAME,
  {
    connection: {
      host: globalServerConfig.worker.redis.host,
      port: globalServerConfig.worker.redis.port,
    },
  },
);

export const enqueueArtifactUpdate = (item: ArtifactUpdateQueueItem) => {
  metrics.jobQueued.inc({
    job_type: 'artifact_update',
  });

  return artifactUpdateQueue.add(`${Date.now()}-${Math.random()}`, item);
};
