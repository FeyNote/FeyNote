import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import {
  jobSummary,
  type ImportJob,
  type ExportJob,
  prismaJobSummaryToJobSummary,
} from '@feynote/prisma/types';
import { JobType } from '@prisma/client';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const getImportExportJob = authenticatedProcedure.
  input(
    z.object({
      id: z.string(),
    }),
  ).
  query(
  async ({ input, ctx }): Promise<(ImportJob | ExportJob)> => {
    const importExportJob = await prisma.job.findUnique({
      where: {
        id: input.id,
        userId: ctx.session.userId,
        type: JobType.Import || JobType.Export,
      },
      ...jobSummary,
    });
    if (!importExportJob) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    return prismaJobSummaryToJobSummary(importExportJob);
  },
);
