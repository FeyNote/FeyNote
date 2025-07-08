import { publicProcedure } from '../../trpc';
import { z } from 'zod';
import * as services from '@feynote/api-services';
import { TRPCError } from '@trpc/server';

export const triggerResetPassword = publicProcedure
  .input(
    z.object({
      email: z.string(),
      returnUrl: z.string(),
    }),
  )
  .mutation(async ({ input }): Promise<string> => {
    // We allow any url in development mode, but in prod mode we want to ensure it's only feynote.com/app.feynote.com for security
    if (
      process.env['NODE_ENV'] !== 'development' &&
      !input.returnUrl.match(/^https:\/\/(app\.)?feynote.com(\/.*)?$/)
    ) {
      throw new TRPCError({
        message: 'Provided returnUrl is not allowed',
        code: 'BAD_REQUEST',
      });
    }

    const result = await services.triggerResetPassword(
      input.email,
      input.returnUrl,
    );

    if (!result) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }

    services.metrics.accountTriggerResetPassword.inc();

    return 'Ok';
  });
