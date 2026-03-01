import { z } from 'zod';
import { publicProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { globalServerConfig } from '@feynote/config';
import { metrics, upsertLogin } from '@feynote/api-services';
import crypto from 'node:crypto';
import type { SessionDTO } from '@feynote/shared-utils';

export const signInWithDesktopGoogle = publicProcedure
  .input(
    z.object({
      code: z.string(),
    }),
  )
  .mutation(
    async ({
      input,
    }): Promise<{
      session: SessionDTO;
      created: boolean;
    }> => {
      const parts = input.code.split('.');
      if (parts.length !== 2) {
        throw new TRPCError({
          message: 'Invalid auth code format',
          code: 'BAD_REQUEST',
        });
      }
      const [payloadB64, hmac] = parts;

      if (!/^[0-9a-f]{64}$/.test(hmac)) {
        throw new TRPCError({
          message: 'Invalid auth code format',
          code: 'BAD_REQUEST',
        });
      }

      const secret = globalServerConfig.google.clientSecret;
      if (!secret) {
        throw new TRPCError({
          message: 'Google OAuth is not configured',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      const expectedHmac = crypto
        .createHmac('sha256', secret)
        .update(payloadB64)
        .digest('hex');

      if (
        !crypto.timingSafeEqual(
          Buffer.from(hmac, 'hex'),
          Buffer.from(expectedHmac, 'hex'),
        )
      ) {
        throw new TRPCError({
          message: 'Invalid auth code signature',
          code: 'UNAUTHORIZED',
        });
      }

      let payload: {
        email: string;
        name: string;
        exp: number;
      };
      try {
        payload = JSON.parse(
          Buffer.from(payloadB64, 'base64url').toString('utf-8'),
        );
      } catch {
        throw new TRPCError({
          message: 'Invalid auth code payload',
          code: 'BAD_REQUEST',
        });
      }

      if (Date.now() > payload.exp) {
        throw new TRPCError({
          message: 'Auth code has expired',
          code: 'UNAUTHORIZED',
        });
      }

      const { session, created } = await upsertLogin(
        payload.name,
        payload.email,
      );

      if (created) {
        metrics.accountCreated.inc({ auth_type: 'google' });
      } else {
        metrics.accountLogin.inc({ auth_type: 'google' });
      }

      return {
        session: {
          id: session.id,
          token: session.token,
          userId: session.userId,
          email: payload.email,
        } satisfies SessionDTO,
        created,
      };
    },
  );
