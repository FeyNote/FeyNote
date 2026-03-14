import * as Sentry from '@sentry/node';
import { Worker } from 'bullmq';
import { WorkspaceUpdateQueueItem } from './WorkspaceUpdateQueueItem';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { logger, metrics } from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import {
  getWorkspaceArtifactsFromYDoc,
  getWorkspaceUserAccessFromYDoc,
} from '@feynote/shared-utils';
import { searchProvider } from '@feynote/search';
import { WORKSPACE_UPDATE_QUEUE_NAME } from './WORKSPACE_UPDATE_QUEUE_NAME';
import { globalServerConfig } from '@feynote/config';
import {
  enqueueOutgoingWebsocketMessage,
  wsRoomNameForUserId,
} from '../outgoingWebsocketMessageQueue/outgoingWebsocketMessageQueue';
import { WebsocketMessageEvent } from '@feynote/global-types';

export const workspaceUpdateQueueWorker = new Worker<
  WorkspaceUpdateQueueItem,
  void
>(
  WORKSPACE_UPDATE_QUEUE_NAME,
  async (args) => {
    metrics.jobStarted.inc({
      job_type: 'workspace_update',
    });

    const timer = metrics.jobProcessed.startTimer();

    try {
      logger.info(`Processing workspace update job ${args.id}`);

      const oldYDoc = new YDoc();
      const oldYBin = Buffer.from(args.data.oldYBinB64, 'base64');
      applyUpdate(oldYDoc, oldYBin);

      const newYDoc = new YDoc();
      const newYBin = Buffer.from(args.data.newYBinB64, 'base64');
      applyUpdate(newYDoc, newYBin);

      const oldArtifactsKV = getWorkspaceArtifactsFromYDoc(oldYDoc);
      const newArtifactsKV = getWorkspaceArtifactsFromYDoc(newYDoc);

      const oldArtifactIds = new Set(
        [...oldArtifactsKV.yarray.toArray()].map((el) => el.key),
      );
      const newArtifactIds = new Set(
        [...newArtifactsKV.yarray.toArray()].map((el) => el.key),
      );

      const addedArtifactIds = [...newArtifactIds].filter(
        (id) => !oldArtifactIds.has(id),
      );
      const removedArtifactIds = [...oldArtifactIds].filter(
        (id) => !newArtifactIds.has(id),
      );

      const oldUserAccessKV = getWorkspaceUserAccessFromYDoc(oldYDoc);
      const newUserAccessKV = getWorkspaceUserAccessFromYDoc(newYDoc);

      const oldUserIds = new Set(
        [...oldUserAccessKV.yarray.toArray()].map((el) => el.key),
      );
      const newUserIds = new Set(
        [...newUserAccessKV.yarray.toArray()].map((el) => el.key),
      );

      const affectedUserIds = new Set([
        args.data.userId,
        ...oldUserIds,
        ...newUserIds,
      ]);

      const changedArtifactIds = [...addedArtifactIds, ...removedArtifactIds];

      if (changedArtifactIds.length > 0) {
        logger.info(
          `Workspace ${args.data.workspaceId}: ${addedArtifactIds.length} artifacts added, ${removedArtifactIds.length} removed`,
        );

        const artifacts = await prisma.artifact.findMany({
          where: { id: { in: changedArtifactIds } },
          select: {
            id: true,
            workspaceArtifacts: {
              select: {
                workspaceId: true,
              },
            },
          },
        });

        for (const artifact of artifacts) {
          try {
            const workspaceIds = artifact.workspaceArtifacts.map(
              (wa) => wa.workspaceId,
            );
            await searchProvider.updateWorkspaceIds(artifact.id, workspaceIds);
          } catch (e) {
            logger.error(
              `Failed to update workspace IDs in search index for artifact ${artifact.id}`,
              e,
            );
            Sentry.captureException(e);
          }
        }
      }

      try {
        for (const userId of affectedUserIds) {
          await enqueueOutgoingWebsocketMessage({
            room: wsRoomNameForUserId(userId),
            event: WebsocketMessageEvent.WorkspaceUpdated,
            json: {
              workspaceId: args.data.workspaceId,
            },
          });
        }
      } catch (e) {
        logger.error(e);
        Sentry.captureException(e);
      }

      metrics.jobProcessed.observe(
        {
          job_type: 'workspace_update',
        },
        timer(),
      );
    } catch (e) {
      logger.error(`Failed processing workspace update job ${args.id}`, e);
      Sentry.captureException(e);

      metrics.jobFailed.inc({
        job_type: 'workspace_update',
      });

      throw e;
    }

    logger.info(`Finished processing workspace update job ${args.id}`);
  },
  {
    autorun: false,
    connection: {
      host: globalServerConfig.worker.redis.host,
      port: globalServerConfig.worker.redis.port,
    },
    prefix: globalServerConfig.worker.redis.keyPrefix,
    removeOnComplete: { count: globalServerConfig.worker.queueCompleteCount },
    removeOnFail: { count: globalServerConfig.worker.queueFailCount },
    concurrency: globalServerConfig.worker.queueConcurrency,
  },
);
