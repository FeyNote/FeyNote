import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { ImportJobType, JobStatus } from '@prisma/client';

export const createImportJob = authenticatedProcedure
  .input(
    z.object({
      s3: z.string(),
      title: z.string(),
      type: z.nativeEnum(ImportJobType),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<void> => {
    console.log('bleh');
  });
