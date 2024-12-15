import './instrument.ts';

import { artifactUpdateQueueWorker } from '@feynote/queue';

artifactUpdateQueueWorker.run();

const shutdown = async () => {
  await artifactUpdateQueueWorker.close();

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
