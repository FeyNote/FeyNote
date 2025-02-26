import { Worker } from 'bullmq';
import { IMPORT_JOB_QUEUE_NAME } from './IMPORT_JOB_QUEUE_NAME';
import { ImportJobQueueItem } from './ImportJobQueueItem';
import { globalServerConfig } from '@feynote/config';
import { ImportJobType, JobStatus } from '@prisma/client';
import { obsidianToStandardizedImport } from './converters/obsidianToStandardizedImport';
import { prisma } from '@feynote/prisma/client';
import { importFromZip } from './importFromZip';
import { logseqToStandardizedImport } from './converters/logseqToStandardizedImport';

export const importJobQueueWorker = new Worker<ImportJobQueueItem, void>(
  IMPORT_JOB_QUEUE_NAME,
  async (args) => {
    console.log(`Received job: ${JSON.stringify(args.data)}`);
    const userId = args.data.triggeredByUserId;
    const importJob = await prisma.importJob.update({
      where: {
        id: args.data.importJobId,
      },
      data: {
        status: JobStatus.InProgress,
      },
      select: {
        type: true,
        file: {
          select: {
            storageKey: true,
          },
        }
      }
    });
    let status: JobStatus = JobStatus.Success;
    try {
      switch (importJob.type) {
        case ImportJobType.Obsidian: {
          await importFromZip(
            importJob.file.storageKey,
            userId,
            (filePaths) => obsidianToStandardizedImport(userId, filePaths)
          );
          break;
        }
        case ImportJobType.Logseq: {
          await importFromZip(
            importJob.file.storageKey,
            userId,
            (filePaths) => logseqToStandardizedImport(userId, filePaths)
          );
          break
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
    await prisma.importJob.update({
      where: {
        id: args.data.importJobId,
      },
      data: {
        status,
      }
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
