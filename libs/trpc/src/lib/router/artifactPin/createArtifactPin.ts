import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { WebsocketMessageEvent } from '@feynote/global-types';
import {
  enqueueOutgoingWebsocketMessage,
  wsRoomNameForUserId,
} from '@feynote/queue';

export const createArtifactPin = authenticatedProcedure
  .input(
    z.object({
      artifactId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      id: string;
    }> => {
      const artifact = await prisma.artifact.findUnique({
        where: {
          id: input.artifactId,
        },
        select: {
          id: true,
          userId: true,
          artifactShares: {
            select: {
              userId: true,
            },
          },
        },
      });

      const hasAccess =
        artifact &&
        (artifact?.userId === ctx.session.userId ||
          artifact.artifactShares.some(
            (share) => share.userId === ctx.session.userId,
          ));
      if (!hasAccess) {
        throw new TRPCError({
          message: 'Artifact does not exist or is not owned by current user',
          code: 'FORBIDDEN',
        });
      }

      const artifactPin = await prisma.artifactPin.create({
        data: {
          artifactId: input.artifactId,
          userId: ctx.session.userId,
        },
        select: {
          id: true,
        },
      });

      try {
        await enqueueOutgoingWebsocketMessage({
          room: wsRoomNameForUserId(ctx.session.userId),
          event: WebsocketMessageEvent.ArtifactPinChanged,
          json: {
            artifactId: input.artifactId,
            pinned: true,
          },
        });
      } catch (e) {
        console.error(e);
        // TODO: Sentry
      }

      return artifactPin;
    },
  );
