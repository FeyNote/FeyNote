import * as Sentry from '@sentry/node';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { searchProvider } from '@feynote/search';
import { TRPCError } from '@trpc/server';
import {
  enqueueOutgoingWebsocketMessage,
  wsRoomNameForUserId,
} from '@feynote/queue';
import { WebsocketMessageEvent } from '@feynote/global-types';

export const deleteArtifact = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
      select: {
        userId: true,
        artifactShares: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!artifact) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    if (artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
      });
    }

    await prisma.artifact.delete({
      where: {
        id: input.id,
      },
    });

    await prisma.artifactRevision.updateMany({
      where: {
        artifactId: input.id,
      },
      data: {
        artifactDeletedAt: new Date(),
      },
    });

    await searchProvider.deleteArtifacts([input.id]);

    return 'Ok';
  });
