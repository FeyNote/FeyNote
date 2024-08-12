import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

export const getArtifactYBinById = authenticatedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
      select: {
        yBin: true,
        userId: true,
      },
    });

    if (!artifact) {
      throw new TRPCError({
        message: 'Artifact does not exist',
        code: 'NOT_FOUND',
      });
    }

    if (artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact not visible to current user',
        code: 'FORBIDDEN',
      });
    }

    return {
      yBin: artifact.yBin,
    };
  });
