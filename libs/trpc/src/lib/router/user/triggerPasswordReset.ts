import { publicProcedure } from '../../trpc';
import { z } from 'zod';
import * as services from '@feynote/api-services';
import { TRPCError } from '@trpc/server';

export const triggerPasswordReset = publicProcedure
  .input(
    z.object({
      email: z.string(),
      returnUrl: z.string(),
    }),
  )
  .mutation(async ({ input }): Promise<void> => {
    const result = await services.triggerPasswordReset(
      input.email,
      input.returnUrl,
    );

    if (!result) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }

    services.metrics.accountPasswordReset.inc();
  });
