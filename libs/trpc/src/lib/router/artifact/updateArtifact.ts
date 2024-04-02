import { getArtifactDetailById } from '@dnd-assistant/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@dnd-assistant/prisma/client';

export const updateArtifact = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
      text: z.string(),
      json: z.any(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const artifact = await getArtifactDetailById(input.id);

    if (artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact not visible to current user',
        code: 'FORBIDDEN',
      });
    }

    await prisma.artifact.update({
      where: {
        id: input.id,
      },
      data: {
        text: input.text,
        json: input.json,
      },
    });

    return 'Ok';
  });
