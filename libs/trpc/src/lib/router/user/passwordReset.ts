import { publicProcedure } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import {
  generatePasswordHashAndSalt,
  isSessionExpired,
} from '@feynote/api-services';
import { validatePassword } from '@feynote/shared-utils';

export const passwordReset = publicProcedure
  .input(
    z.object({
      passwordResetToken: z.string(),
      password: z.string().refine(validatePassword),
    }),
  )
  .mutation(async ({ input }): Promise<void> => {
    const session = await prisma.session.findUnique({
      where: {
        token: input.passwordResetToken,
      },
    });
    if (!session) {
      throw new TRPCError({
        code: 'FORBIDDEN',
      });
    }

    const isExpired = isSessionExpired(session);
    if (isExpired) {
      throw new TRPCError({
        code: 'FORBIDDEN',
      });
    }

    const { hash, salt, version } = await generatePasswordHashAndSalt(
      input.password,
    );

    await prisma.user.update({
      where: {
        id: session.userId,
      },
      data: {
        passwordHash: hash,
        passwordSalt: salt,
        passwordVersion: version,
      },
    });
  });
