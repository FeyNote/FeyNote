import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import {
  enqueueOutgoingWebsocketMessage,
  wsRoomNameForUserId,
} from '@feynote/queue';
import { WebsocketMessageEvent } from '@feynote/global-types';

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
      const message = await prisma.message.create({
        data: { threadId: input.threadId, json: input.message },
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
