import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import {
  enqueueOutgoingWebsocketMessage,
  wsRoomNameForUserId,
} from '@feynote/queue';
import { WebsocketMessageEvent } from '@feynote/global-types';
import { TRPCError } from '@trpc/server';

export const saveMessage = authenticatedProcedure
  .input(
    z.object({
      threadId: z.string(),
      message: z.any(),
    }),
  )
  .mutation(
    async ({
      input,
      ctx,
    }): Promise<{
      id: string;
      json: JsonValue;
      threadId: string;
      createdAt: Date;
      updatedAt: Date;
    }> => {
      const thread = await prisma.thread.findFirst({
        where: { id: input.threadId, userId: ctx.session.userId },
      });
      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }
      const message = await prisma.message.create({
        data: {
          id: input.message.id,
          threadId: input.threadId,
          vercelJsonV5: input.message,
        },
      });
      enqueueOutgoingWebsocketMessage({
        room: wsRoomNameForUserId(ctx.session.userId),
        event: WebsocketMessageEvent.ThreadUpdated,
        json: {
          threadId: input.threadId,
        },
      });
      return message;
    },
  );
