import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

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
      return message;
    },
  );
