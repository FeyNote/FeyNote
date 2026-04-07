import { logger } from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import { JobStatus } from '@prisma/client';
import * as Sentry from '@sentry/node';

export const cleanupJobs = async (args: {
  deleteAfterDays: number;
  timeoutAfterMinutes: number;
}) => {
  try {
    logger.info(`Running Job Cleanup`);

    const deleteBeforeDate = new Date();
    deleteBeforeDate.setDate(deleteBeforeDate.getDate() - args.deleteAfterDays);

    const deleted = await prisma.job.deleteMany({
      where: {
        updatedAt: {
          lt: deleteBeforeDate,
        },
      },
    });

    logger.info(`Deleted ${deleted.count} old jobs`);

    const timeoutBeforeDate = new Date();
    timeoutBeforeDate.setMinutes(
      timeoutBeforeDate.getMinutes() - args.timeoutAfterMinutes,
    );

    const updated = await prisma.job.updateMany({
      where: {
        updatedAt: {
          lt: timeoutBeforeDate,
        },
        status: {
          not: JobStatus.success,
        },
      },
      data: {
        status: JobStatus.failed,
      },
    });

    logger.info(`Marked ${updated.count} hanging jobs as failed`);
  } catch (e) {
    logger.error(e);
    Sentry.captureException(e);

    throw e;
  }
};
