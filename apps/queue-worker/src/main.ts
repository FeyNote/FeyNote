import {
  artifactUpdateQueueWorker,
  importJobQueueWorker,
} from '@feynote/queue';

artifactUpdateQueueWorker.run();
importJobQueueWorker.run();

const shutdown = async () => {
  await artifactUpdateQueueWorker.close();
  await importJobQueueWorker.close();

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
