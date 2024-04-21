import { z } from 'zod';
import { publicProcedure } from '../../trpc';
import { OAuth2Client } from 'google-auth-library';
import { TRPCError } from '@trpc/server';
import { upsertLogin } from '@feynote/api-services';

export const signInWithGoogle = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
      credential: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { clientId, credential } = input;
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new TRPCError({
        message: 'User email must be provided as part of the payload.',
        code: 'BAD_REQUEST',
      });
    }
    const session = await upsertLogin(payload.email);
    return session.token;
  });
