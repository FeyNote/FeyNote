import { Worker } from 'bullmq';
import { JOB_QUEUE_NAME } from './JOB_QUEUE_NAME';
import { JobQueueItem } from './jobQueueItem';
import { globalServerConfig } from '@feynote/config';
import { JobStatus, JobType } from '@prisma/client';
import { prisma } from '@feynote/prisma/client';
import {
  jobSummary,
  prismaJobSummaryToJobSummary,
} from '@feynote/prisma/types';
import { importJobHandler } from './import/importJobHandler';
import { exportJobHandler } from './export/exportJobHandler';

export const jobQueueWorker = new Worker<JobQueueItem, void>(
  JOB_QUEUE_NAME,
  async (args) => {
    const prismaJobSummary = await prisma.job.update({
      where: {
        id: args.data.jobId,
      },
      data: {
        status: JobStatus.inprogress,
      },
      ...jobSummary,
    });
    const job = prismaJobSummaryToJobSummary(prismaJobSummary);
    let status: JobStatus = JobStatus.success;

    try {
      switch (job.type) {
        case JobType.import: {
          await importJobHandler(job);
          break;
        }
        case JobType.export: {
          await exportJobHandler(job);
          break;
        }
        default:
          throw new Error(`Invalid job type: ${args.data}`);
      }
    } catch (e) {
      console.error(`Failed processing job ${args.id}`, e);
      status = JobStatus.failed;
    }

    await prisma.job.update({
      where: {
        id: args.data.jobId,
      },
      data: {
        status,
        progress: 100,
      },
    });
    console.log(`Finished processing job ${args.id}`);
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
