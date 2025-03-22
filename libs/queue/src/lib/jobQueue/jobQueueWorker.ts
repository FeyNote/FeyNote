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
    console.log(`Received job: ${JSON.stringify(args.data)}`);
    const userId = args.data.triggeredByUserId;
    const prismaJobSummary = await prisma.job.update({
      where: {
        id: args.data.jobId,
      },
      data: {
        status: JobStatus.InProgress,
      },
      ...jobSummary,
    });
    const job = prismaJobSummaryToJobSummary(prismaJobSummary);
    let status: JobStatus = JobStatus.Success;
    try {
      switch (job.type) {
        case JobType.Import: {
          importJobHandler(job, userId);
          break;
        }
        case JobType.Export: {
          exportJobHandler(job, userId);
          break;
        }
        default:
          throw new Error(
            `Invalid job type provided by queue worker: ${args.data}`,
          );
      }
    } catch (e) {
      console.error(`Failed processing import job ${args.id}`, e);
      status = JobStatus.Failed;
    }
    await prisma.job.update({
      where: {
        id: args.data.jobId,
      },
      data: {
        status,
      },
    });
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
