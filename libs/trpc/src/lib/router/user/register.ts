import { publicProcedure } from '../../trpc';
import { z } from 'zod';
import * as services from '@feynote/api-services';
import { UserAlreadyExistError } from '@feynote/api-services';
import { TRPCError } from '@trpc/server';
import { validateEmail, validatePassword } from '@feynote/shared-utils';

export const register = publicProcedure
  .input(
    z.object({
      email: z.string().refine(validateEmail),
      password: z.string().refine(validatePassword),
    }),
  )
  .mutation(async ({ input }) => {
    try {
      const session = await services.register(input.email, input.password);
      return session;
    } catch (e) {
      if (e instanceof UserAlreadyExistError) {
        throw new TRPCError({
          message: 'User already exists with the given email',
          code: 'CONFLICT',
        });
      }
      throw e;
    }
  });
