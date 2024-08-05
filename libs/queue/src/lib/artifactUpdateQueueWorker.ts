import { Worker } from 'bullmq';
import { ArtifactUpdateQueueItem } from './ArtifactUpdateQueueItem';
import { ARTIFACT_UPDATE_QUEUE_NAME } from './ARTIFACT_UPDATE_QUEUE_NAME';
import { globalServerConfig } from '@feynote/config';
import { ARTIFACT_META_KEY, ARTIFACT_TIPTAP_BODY_KEY, getTextForJSONContent, getTiptapContentFromYjsDoc } from '@feynote/shared-utils';
import { applyUpdate, Doc } from 'yjs';
import { prisma } from '@feynote/prisma/client';
import { Prisma } from '@prisma/client';
import {
  updateArtifactTitleReferenceText,
  updateArtifactContentReferenceText,
  updateArtifactOutgoingReferences,
} from '@feynote/api-services';

export const artifactUpdateQueueWorker = new Worker<
  ArtifactUpdateQueueItem,
  void
>(
  ARTIFACT_UPDATE_QUEUE_NAME,
  async (args) => {
    try {
      console.log(`Processing job ${args.id}`);

      const oldYjsDoc = new Doc();
      const oldYBin = Buffer.from(args.data.oldYBinB64, 'base64');
      applyUpdate(oldYjsDoc, oldYBin);

      const newYjsDoc = new Doc();
      const newYBin = Buffer.from(args.data.newYBinB64, 'base64');
      applyUpdate(newYjsDoc, newYBin);

      const oldJSONContent = getTiptapContentFromYjsDoc(
        oldYjsDoc,
        ARTIFACT_TIPTAP_BODY_KEY,
      );
      const newJSONContent = getTiptapContentFromYjsDoc(
        newYjsDoc,
        ARTIFACT_TIPTAP_BODY_KEY,
      );

      const oldTitle = oldYjsDoc
        .getMap(ARTIFACT_META_KEY)
        .get('title') as string;
      const newTitle = newYjsDoc
        .getMap(ARTIFACT_META_KEY)
        .get('title') as string;

      await prisma.$transaction(
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

          await updateArtifactOutgoingReferences(
            args.data.artifactId,
            newJSONContent,
            tx,
          );
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (e) {
      console.log(`Failed processing job ${args.id}`, e);

      // TODO: Cloud logging

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
