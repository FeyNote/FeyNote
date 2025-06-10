import * as Sentry from '@sentry/node';
import { Worker } from 'bullmq';
import { ArtifactUpdateQueueItem } from './ArtifactUpdateQueueItem';
import { Doc as YDoc, applyUpdate } from 'yjs';
import {
  updateArtifactTitleReferenceText,
  updateArtifactContentReferenceText,
  updateArtifactOutgoingReferences,
  createArtifactRevision,
  updateArtifactAccess,
  logger,
  metrics,
} from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import { ArtifactType, Prisma } from '@prisma/client';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getMetaFromYArtifact,
  getTextForJSONContent,
  getTiptapContentFromYjsDoc,
  getUserAccessFromYArtifact,
  TLDRAW_YDOC_STORE_KEY,
} from '@feynote/shared-utils';
import { searchProvider } from '@feynote/search';
import { ARTIFACT_UPDATE_QUEUE_NAME } from './ARTIFACT_UPDATE_QUEUE_NAME';
import { globalServerConfig } from '@feynote/config';
import {
  enqueueOutgoingWebsocketMessage,
  wsRoomNameForUserId,
} from '../outgoingWebsocketMessageQueue/outgoingWebsocketMessageQueue';
import { WebsocketMessageEvent } from '@feynote/global-types';
import type { TLRecord } from 'tldraw';

export const artifactUpdateQueueWorker = new Worker<
  ArtifactUpdateQueueItem,
  void
>(
  ARTIFACT_UPDATE_QUEUE_NAME,
  async (args) => {
    metrics.jobStarted.inc({
      job_type: 'artifact_update',
    });

    const timer = metrics.jobProcessed.startTimer();

    try {
      logger.info(`Processing job ${args.id}`);

      const oldYjsDoc = new YDoc();
      const oldYBin = Buffer.from(args.data.oldYBinB64, 'base64');
      applyUpdate(oldYjsDoc, oldYBin);

      const newYjsDoc = new YDoc();
      const newYBin = Buffer.from(args.data.newYBinB64, 'base64');
      applyUpdate(newYjsDoc, newYBin);

      const oldReadableUserIds = args.data.oldReadableUserIds.sort((a, b) =>
        a.localeCompare(b),
      );
      const newReadableUserIds = args.data.oldReadableUserIds.sort((a, b) =>
        a.localeCompare(b),
      );

      const oldYMeta = getMetaFromYArtifact(oldYjsDoc);
      const oldTitle = oldYMeta.title;
      const newYMeta = getMetaFromYArtifact(newYjsDoc);
      const newTitle = newYMeta.title;
      const type = newYMeta.type;
      const oldYUserAccess = getUserAccessFromYArtifact(oldYjsDoc);
      const newYUserAccess = getUserAccessFromYArtifact(newYjsDoc);

      const newTLDrawData = newYjsDoc.getArray<{
        key: string;
        val: TLRecord;
      }>(TLDRAW_YDOC_STORE_KEY);

      const oldJSONContent = getTiptapContentFromYjsDoc(
        oldYjsDoc,
        ARTIFACT_TIPTAP_BODY_KEY,
      );
      const newJSONContent = getTiptapContentFromYjsDoc(
        newYjsDoc,
        ARTIFACT_TIPTAP_BODY_KEY,
      );

      const oldText = getTextForJSONContent(oldJSONContent);
      const newText = getTextForJSONContent(newJSONContent);

      const { referencesMutatedCount } = await prisma.$transaction(
        async (tx) => {
          await updateArtifactTitleReferenceText(
            args.data.artifactId,
            oldTitle,
            newTitle,
            tx,
          );

          await updateArtifactContentReferenceText(
            args.data.artifactId,
            oldJSONContent,
            newJSONContent,
            tx,
          );

          let referencesMutatedCount = 0;
          if (type === ArtifactType.tiptap) {
            referencesMutatedCount = await updateArtifactOutgoingReferences(
              args.data.artifactId,
              {
                jsonContent: newJSONContent,
              },
              tx,
            );
          }
          if (type === ArtifactType.tldraw) {
            referencesMutatedCount = await updateArtifactOutgoingReferences(
              args.data.artifactId,
              {
                tldrawContent: newTLDrawData,
              },
              tx,
            );
          }

          await updateArtifactAccess({
            artifactId: args.data.artifactId,
            oldYUserAccess,
            newYUserAccess,
            oldLinkAccessLevel: oldYMeta.linkAccessLevel,
            newLinkAccessLevel: newYMeta.linkAccessLevel,
            tx,
          });

          await createArtifactRevision(args.data.artifactId, tx);

          if (newYMeta.deletedAt) {
            await searchProvider.deleteArtifacts([args.data.artifactId]);
          } else {
            const indexableArtifact = {
              id: args.data.artifactId,
              userId: args.data.userId,
              oldState: {
                title: oldTitle,
                readableUserIds: oldReadableUserIds,
                text: oldText,
                jsonContent: oldJSONContent,
              },
              newState: {
                title: newTitle,
                readableUserIds: newReadableUserIds,
                text: newText,
                jsonContent: newJSONContent,
              },
            };

            await searchProvider.indexArtifact(indexableArtifact);
          }

          return {
            referencesMutatedCount,
          };
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
            event: WebsocketMessageEvent.ArtifactUpdated,
            json: {
              artifactId: args.data.artifactId,
              updated: {
                title: oldTitle !== newTitle,
                text: oldText !== newText,
                readableUserIds:
                  oldReadableUserIds.join(',') !== newReadableUserIds.join(','),
                references: referencesMutatedCount > 0,
                deletedAt: oldYMeta.deletedAt !== newYMeta.deletedAt,
              },
            },
          });
        }
      } catch (e) {
        logger.error(e);
        Sentry.captureException(e);
      }

      metrics.jobProcessed.observe({
        value: timer(),
        labels: {
          job_type: 'artifact_update',
        },
      });
    } catch (e) {
      logger.error(`Failed processing job ${args.id}`, e);
      Sentry.captureException(e);

      metrics.jobFailed.inc({
        job_type: 'artifact_update',
      });

      throw e;
    }

    logger.info(`Finished processing job ${args.id}`);
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
