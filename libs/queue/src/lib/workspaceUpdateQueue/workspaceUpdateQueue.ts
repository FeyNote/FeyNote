import { Queue } from 'bullmq';
import { WORKSPACE_UPDATE_QUEUE_NAME } from './WORKSPACE_UPDATE_QUEUE_NAME';
import { WorkspaceUpdateQueueItem } from './WorkspaceUpdateQueueItem';
import { globalServerConfig } from '@feynote/config';
import { metrics } from '@feynote/api-services';

export const workspaceUpdateQueue = new Queue<WorkspaceUpdateQueueItem, void>(
  WORKSPACE_UPDATE_QUEUE_NAME,
  {
    connection: {
      host: globalServerConfig.worker.redis.host,
      port: globalServerConfig.worker.redis.port,
    },
    prefix: globalServerConfig.worker.redis.keyPrefix,
  },
);

export const enqueueWorkspaceUpdate = (item: WorkspaceUpdateQueueItem) => {
  metrics.jobQueued.inc({
    job_type: 'workspace_update',
  });

  return workspaceUpdateQueue.add(`${Date.now()}-${Math.random()}`, item);
};
