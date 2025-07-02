import { publicProcedure } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import {
  generatePasswordHashAndSalt,
  isAuthResetTokenExpired,
  metrics,
  PasswordChangedMail,
} from '@feynote/api-services';
import { validatePassword } from '@feynote/shared-utils';
import { AuthResetTokenType } from '@prisma/client';

export const resetPassword = publicProcedure
  .input(
    z.object({
      authResetToken: z.string(),
      password: z.string().refine(validatePassword),
    }),
  )
  .mutation(async ({ input }): Promise<string> => {
    const authResetToken = await prisma.authResetToken.findUnique({
      where: {
        token: input.authResetToken,
        type: AuthResetTokenType.password,
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

    const { hash, salt, version } = await generatePasswordHashAndSalt(
      input.password,
    );

    await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUniqueOrThrow({
        where: {
          id: authResetToken.userId,
        },
      });

      await tx.user.update({
        where: {
          id: authResetToken.userId,
        },
        data: {
          passwordHash: hash,
          passwordSalt: salt,
          passwordVersion: version,
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

      await new PasswordChangedMail({
        to: [currentUser.email],
        name: currentUser.username || currentUser.email.toLowerCase(),
      }).send();

      metrics.accountResetPassword.inc();
    });

    return 'Ok';
  });
