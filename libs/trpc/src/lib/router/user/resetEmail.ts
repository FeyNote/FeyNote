import { prisma } from '@feynote/prisma/client';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { validateEmail } from '@feynote/shared-utils';
import {
  EmailChangedFromThisAddressMail,
  EmailChangedToThisAddressMail,
  isAuthResetTokenExpired,
  metrics,
} from '@feynote/api-services';
import { publicProcedure } from '../../trpc';
import { AuthResetTokenType } from '@prisma/client';

export const resetEmail = publicProcedure
  .input(
    z.object({
      authResetToken: z.string(),
      email: z.string().refine(validateEmail),
    }),
  )
  .mutation(async ({ input }): Promise<string> => {
    const authResetToken = await prisma.authResetToken.findUnique({
      where: {
        token: input.authResetToken,
        type: AuthResetTokenType.email,
      },
    });

    if (!authResetToken) {
      throw new TRPCError({
        code: 'FORBIDDEN',
      });
    }

    const isExpired = isAuthResetTokenExpired(authResetToken);
    if (isExpired) {
      throw new TRPCError({
        code: 'FORBIDDEN',
      });
    }

    await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUniqueOrThrow({
        where: {
          id: authResetToken.userId,
        },
      });

      if (
        !currentUser.passwordHash ||
        !currentUser.passwordSalt ||
        !currentUser.passwordVersion
      ) {
        throw new TRPCError({
          message:
            'Changing email for an SSO user without a password set is not supported',
          code: 'PRECONDITION_FAILED',
        });
      }

      const overlappingUser = await tx.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (overlappingUser) {
        throw new TRPCError({
          message: 'Email is already in-use by another user',
          code: 'CONFLICT',
        });
      }

      await tx.user.update({
        where: {
          id: authResetToken.userId,
        },
        data: {
          // Email is encorced unique at the DB-level so we're not concerned about collisions between this and the original check. This would 500 in the case of a race condition
          email: input.email,
        },
      });

      await tx.authResetToken.update({
        where: {
          id: authResetToken.id,
        },
        data: {
          expiresAt: new Date(),
        },
      });

      await new EmailChangedFromThisAddressMail({
        to: [currentUser.email],
        name: currentUser.username || currentUser.email.toLowerCase(),
        newEmail: input.email,
        authResetToken: input.authResetToken,
      }).send();

      await new EmailChangedToThisAddressMail({
        to: [currentUser.email],
        name: currentUser.username || currentUser.email.toLowerCase(),
      }).send();

      metrics.accountResetEmail.inc();
    });

    return 'Ok';
  });
