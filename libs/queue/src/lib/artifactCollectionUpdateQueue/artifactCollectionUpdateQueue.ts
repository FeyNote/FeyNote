import { Queue } from 'bullmq';
import { ARTIFACT_COLLECTION_UPDATE_QUEUE_NAME } from './ARTIFACT_COLLECTION_UPDATE_QUEUE_NAME';
import { ArtifactCollectionUpdateQueueItem } from './ArtifactCollectionUpdateQueueItem';
import { globalServerConfig } from '@feynote/config';

export const artifactCollectionUpdateQueue = new Queue<
  ArtifactCollectionUpdateQueueItem,
  void
>(ARTIFACT_COLLECTION_UPDATE_QUEUE_NAME, {
  connection: {
    host: globalServerConfig.worker.redis.host,
    port: globalServerConfig.worker.redis.port,
  },
});

export const enqueueArtifactCollectionUpdate = (
  item: ArtifactCollectionUpdateQueueItem,
) => {
  return artifactCollectionUpdateQueue.add(
    `${Date.now()}-${Math.random()}`,
    item,
  );
};
