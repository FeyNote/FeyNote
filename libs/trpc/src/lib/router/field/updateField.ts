import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@dnd-assistant/prisma/client';

export const updateField = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
      imageIds: z.array(z.string()).optional(),
      text: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const field = await prisma.field.findUnique({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        artifact: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!field) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }

    if (field.artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'You do not own this field',
        code: 'FORBIDDEN',
      });
    }

    if (input.text && input.imageIds) {
      throw new TRPCError({
        message: 'Input must be either text OR images',
        code: 'BAD_REQUEST',
      });
    }

    if (input.imageIds) {
      await prisma.fieldImage.deleteMany({
        where: {
          fieldId: input.id,
        },
      });

      await prisma.fieldImage.createMany({
        data: input.imageIds.map((imageId, idx) => ({
          fieldId: input.id,
          imageId,
          order: idx,
        })),
      });
    }

    if (input.text) {
      await prisma.field.update({
        where: {
          id: input.id,
        },
        data: {
          text: input.text,
        },
      });
    }

    return;
  });
