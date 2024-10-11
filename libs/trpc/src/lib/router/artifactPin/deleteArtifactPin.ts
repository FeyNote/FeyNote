import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { WebsocketMessageEvent } from '@feynote/prisma/types';
import {
  enqueueOutgoingWebsocketMessage,
  wsRoomNameForUserId,
} from '@feynote/queue';

export const deleteArtifactPin = authenticatedProcedure
  .input(
    z.object({
      artifactId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
    await prisma.artifactPin.deleteMany({
      where: {
        artifactId: input.artifactId,
        userId: ctx.session.userId,
      },
    });

    try {
      await enqueueOutgoingWebsocketMessage({
        room: wsRoomNameForUserId(ctx.session.userId),
        event: WebsocketMessageEvent.ArtifactPinChanged,
        json: {
          artifactId: input.artifactId,
          pinned: false,
        },
      });
    } catch (e) {
      console.error(e);
      // TODO: Sentry
    }

    return 'Ok';
  });
