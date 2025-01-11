import * as Sentry from '@sentry/node';
import { Worker } from 'bullmq';
import { ArtifactCollectionUpdateQueueItem } from './ArtifactCollectionUpdateQueueItem';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { prisma } from '@feynote/prisma/client';
import { Prisma } from '@prisma/client';
import { getMetaFromYArtifactCollection } from '@feynote/shared-utils';
import { ARTIFACT_COLLECTION_UPDATE_QUEUE_NAME } from './ARTIFACT_COLLECTION_UPDATE_QUEUE_NAME';
import { globalServerConfig } from '@feynote/config';
import {
  enqueueOutgoingWebsocketMessage,
  wsRoomNameForUserId,
} from '../outgoingWebsocketMessageQueue/outgoingWebsocketMessageQueue';
import { WebsocketMessageEvent } from '@feynote/global-types';

export const artifactCollectionUpdateQueueWorker = new Worker<
  ArtifactCollectionUpdateQueueItem,
  void
>(
  ARTIFACT_COLLECTION_UPDATE_QUEUE_NAME,
  async (args) => {
    try {
      console.log(`Processing job ${args.id}`);

      const oldYjsDoc = new YDoc();
      const oldYBin = Buffer.from(args.data.oldYBinB64, 'base64');
      applyUpdate(oldYjsDoc, oldYBin);

      const newYjsDoc = new YDoc();
      const newYBin = Buffer.from(args.data.newYBinB64, 'base64');
      applyUpdate(newYjsDoc, newYBin);

      const oldYMeta = getMetaFromYArtifactCollection(oldYjsDoc);
      const oldTitle = oldYMeta.title;
      const oldReadableUserIds = Object.keys(
        oldYMeta.userAccess?.toJSON() ?? {},
      );
      const newYMeta = getMetaFromYArtifactCollection(newYjsDoc);
      const newTitle = newYMeta.title;
      const newReadableUserIds = Object.keys(
        newYMeta.userAccess?.toJSON() ?? {},
      );

      await prisma.$transaction(
        async (tx) => {
          await tx.artifactCollectionShare.deleteMany({
            where: {
              artifactCollectionId: args.data.artifactCollectionId,
            },
          });

          for (const [userId, opts] of oldYMeta.userAccess?.entries() ?? []) {
            await tx.artifactCollectionShare.create({
              data: {
                artifactCollectionId: args.data.artifactCollectionId,
                userId,
                accessLevel: opts.accessLevel,
              },
            });
          }
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      try {
        for (const userId of new Set([
          ...oldReadableUserIds,
          ...newReadableUserIds,
        ])) {
          await enqueueOutgoingWebsocketMessage({
            room: wsRoomNameForUserId(userId),
            event: WebsocketMessageEvent.ArtifactCollectionUpdated,
            json: {
              artifactId: args.data.artifactCollectionId,
              updated: {
                title: oldTitle !== newTitle,
                readableUserIds:
                  oldReadableUserIds.join(',') !== newReadableUserIds.join(','),
              },
            },
          });
        }
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
      }
    } catch (e) {
      console.log(`Failed processing job ${args.id}`, e);
      Sentry.captureException(e);

      throw e;
    }

    console.log(`Finished processing job ${args.id}`);
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
