import './instrument.ts';

import {
  artifactCollectionUpdateQueueWorker,
  artifactUpdateQueueWorker,
} from '@feynote/queue';

artifactUpdateQueueWorker.run();
artifactCollectionUpdateQueueWorker.run();

const shutdown = async () => {
  await Promise.all([
    artifactUpdateQueueWorker.close(),
    artifactCollectionUpdateQueueWorker.close(),
  ]);

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
