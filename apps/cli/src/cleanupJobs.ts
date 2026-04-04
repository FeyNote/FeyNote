import { prisma } from "@feynote/prisma/client";
import { JobStatus } from "@prisma/client";

export const cleanupJobs = async (args: {
  deleteAfterDays: number;
  timeoutAfterMinutes: number;
}) => {
  const deleteBeforeDate = new Date();
  deleteBeforeDate.setDate(deleteBeforeDate.getDate() - args.deleteAfterDays);

  await prisma.job.deleteMany({
    where: {
      updatedAt: {
        lt: deleteBeforeDate
      }
    }
  });

  const timeoutBeforeDate = new Date();
  timeoutBeforeDate.setDate(timeoutBeforeDate.getDate() - args.timeoutAfterMinutes);

  await prisma.job.updateMany({
    where: {
      updatedAt: {
        lt: timeoutBeforeDate
      },
      status: {
        not: JobStatus.success,
      }
    },
    data: {
      status: JobStatus.failed
    }
  })
}
