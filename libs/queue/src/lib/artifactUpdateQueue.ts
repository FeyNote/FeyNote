import { Queue } from 'bullmq';
import { ARTIFACT_UPDATE_QUEUE_NAME } from './ARTIFACT_UPDATE_QUEUE_NAME';
import { ArtifactUpdateQueueItem } from './ArtifactUpdateQueueItem';
import { globalServerConfig } from '@feynote/config';

export const artifactUpdateQueue = new Queue<ArtifactUpdateQueueItem, void>(
  ARTIFACT_UPDATE_QUEUE_NAME,
  {
    connection: {
      host: globalServerConfig.redis.host,
      port: globalServerConfig.redis.port,
    },
  },
);

export const enqueueArtifactUpdate = (item: ArtifactUpdateQueueItem) => {
  return artifactUpdateQueue.add(`${Date.now()}-${Math.random()}`, item);
};
