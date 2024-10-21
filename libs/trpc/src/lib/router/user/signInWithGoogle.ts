import { z } from 'zod';
import { publicProcedure } from '../../trpc';
import { OAuth2Client } from 'google-auth-library';
import { TRPCError } from '@trpc/server';
import { upsertLogin } from '@feynote/api-services';
import type { SessionDTO } from '@feynote/shared-utils';

export const signInWithGoogle = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
      credential: z.string(),
    }),
  )
  .mutation(
    async ({
      input,
    }): Promise<{
      session: SessionDTO;
      created: boolean;
    }> => {
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
      const { session, created } = await upsertLogin(
        payload.name || payload.email,
        payload.email,
      );

      return {
        session: {
          token: session.token,
          userId: session.userId,
          email: payload.email,
        } satisfies SessionDTO,
        created,
      };
    },
  );
