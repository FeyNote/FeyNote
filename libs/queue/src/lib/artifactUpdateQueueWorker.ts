import { Worker } from 'bullmq';
import { ArtifactUpdateQueueItem } from './ArtifactUpdateQueueItem';
import * as Y from 'yjs';
import {
  updateArtifactTitleReferenceText,
  updateArtifactContentReferenceText,
  updateArtifactOutgoingReferences,
} from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import { Prisma } from '@prisma/client';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
  getTextForJSONContent,
  getTiptapContentFromYjsDoc,
} from '@feynote/shared-utils';
import { searchProvider } from '@feynote/search';
import { ARTIFACT_UPDATE_QUEUE_NAME } from './ARTIFACT_UPDATE_QUEUE_NAME';
import { globalServerConfig } from '@feynote/config';

export const artifactUpdateQueueWorker = new Worker<
  ArtifactUpdateQueueItem,
  void
>(
  ARTIFACT_UPDATE_QUEUE_NAME,
  async (args) => {
    const oldYjsDoc = new Y.Doc();
    Y.applyUpdate(oldYjsDoc, args.data.oldYBin);
    const newYjsDoc = new Y.Doc();
    Y.applyUpdate(newYjsDoc, args.data.newYBin);

    const oldJSONContent = getTiptapContentFromYjsDoc(
      oldYjsDoc,
      ARTIFACT_TIPTAP_BODY_KEY,
    );
    const newJSONContent = getTiptapContentFromYjsDoc(
      newYjsDoc,
      ARTIFACT_TIPTAP_BODY_KEY,
    );

    const oldTitle = oldYjsDoc.getMap(ARTIFACT_META_KEY).get('title') as string;
    const newTitle = newYjsDoc.getMap(ARTIFACT_META_KEY).get('title') as string;

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

        const indexableArtifact = {
          id: args.data.artifactId,
          userId: args.data.userId,
          title: newTitle,
          text: getTextForJSONContent(newJSONContent),
          jsonContent: newJSONContent,
        };

        await searchProvider.indexArtifact(indexableArtifact);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  },
  {
    autorun: false,
    connection: {
      host: globalServerConfig.redis.host,
      port: globalServerConfig.redis.port,
    },
    removeOnComplete: { count: globalServerConfig.worker.queueCompleteCount },
    removeOnFail: { count: globalServerConfig.worker.queueFailCount },
    concurrency: globalServerConfig.worker.queueConcurrency,
  },
);
