import { publicProcedure } from '../../trpc';
import { z } from 'zod';
import * as services from '@feynote/api-services';
import {
  InvalidCredentialsError,
  UserNoPasswordError,
  UserNotFoundError,
} from '@feynote/api-services';
import { TRPCError } from '@trpc/server';

export const login = publicProcedure
  .input(
    z.object({
      email: z.string(),
      password: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    try {
      const session = await services.login(input.email, input.password);
      return session;
    } catch (e) {
      if (e instanceof UserNoPasswordError) {
        throw new TRPCError({
          message:
            'User does not have a password set. Try using an alternative credential provider.',
          code: 'FORBIDDEN',
        });
      }
      if (
        e instanceof UserNotFoundError ||
        e instanceof InvalidCredentialsError
      ) {
        throw new TRPCError({
          message: 'Credentials provided do not match what was stored.',
          code: 'BAD_REQUEST',
        });
      }
      throw e;
    }
  });
