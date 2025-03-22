import { artifactUpdateQueueWorker, jobQueueWorker } from '@feynote/queue';
import './instrument.ts';

artifactUpdateQueueWorker.run();
jobQueueWorker.run();

const shutdown = async () => {
  await artifactUpdateQueueWorker.close();
  await jobQueueWorker.close();

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
