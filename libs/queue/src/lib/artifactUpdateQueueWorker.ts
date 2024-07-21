import { Worker } from 'bullmq';
import { ArtifactUpdateQueueItem } from './ArtifactUpdateQueueItem';
import { ARTIFACT_UPDATE_QUEUE_NAME } from './ARTIFACT_UPDATE_QUEUE_NAME';
import { globalServerConfig } from '@feynote/config';

export const artifactUpdateQueueWorker = new Worker<
  ArtifactUpdateQueueItem,
  void
>(
  ARTIFACT_UPDATE_QUEUE_NAME,
  async (args) => {
    try {
      console.log(`Processing job ${args.id}`);

      // TODO: What the heck does this do anymore

      // const oldYjsDoc = new Y.Doc();
      // const oldYBin = Buffer.from(args.data.oldYBinB64, 'base64');
      // Y.applyUpdate(oldYjsDoc, oldYBin);
      //
      // const newYjsDoc = new Y.Doc();
      // const newYBin = Buffer.from(args.data.newYBinB64, 'base64');
      // Y.applyUpdate(newYjsDoc, newYBin);
      //
      // const oldJSONContent = getTiptapContentFromYjsDoc(
      //   oldYjsDoc,
      //   ARTIFACT_TIPTAP_BODY_KEY,
      // );
      // const newJSONContent = getTiptapContentFromYjsDoc(
      //   newYjsDoc,
      //   ARTIFACT_TIPTAP_BODY_KEY,
      // );
      //
      // const oldTitle = oldYjsDoc
      //   .getMap(ARTIFACT_META_KEY)
      //   .get('title') as string;
      // const newTitle = newYjsDoc
      //   .getMap(ARTIFACT_META_KEY)
      //   .get('title') as string;
      //
      // await prisma.$transaction(
      //   async (tx) => {
      //     const indexableArtifact = {
      //       id: args.data.artifactId,
      //       userId: args.data.userId,
      //       oldState: {
      //         title: oldTitle,
      //         text: getTextForJSONContent(oldJSONContent),
      //         jsonContent: oldJSONContent,
      //       },
      //       newState: {
      //         title: newTitle,
      //         text: getTextForJSONContent(newJSONContent),
      //         jsonContent: newJSONContent,
      //       },
      //     };
      //
      //     await searchProvider.indexArtifact(indexableArtifact);
      //   },
      //   {
      //     isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      //   },
      // );
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
