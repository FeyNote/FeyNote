import { publicProcedure } from '../../trpc';
import { z } from 'zod';
import * as services from '@feynote/api-services';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';

export const triggerResetEmail = publicProcedure
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

    const requestingUser = await prisma.user.findUniqueOrThrow({
      where: {
        email: input.email,
      },
    });

    if (
      !requestingUser.passwordHash ||
      !requestingUser.passwordSalt ||
      !requestingUser.passwordVersion
    ) {
      throw new TRPCError({
        message:
          'Changing email for an SSO user without a password set is not supported',
        code: 'PRECONDITION_FAILED',
      });
    }

    const result = await services.triggerResetEmail(
      input.email,
      input.returnUrl,
    );

    if (!result) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }

    services.metrics.accountTriggerResetEmail.inc();

    return 'Ok';
  });
