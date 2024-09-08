import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';

export const deleteArtifactShare = authenticatedProcedure
  .input(
    z.object({
      artifactId: z.string(),
      userId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.artifactId,
        userId: ctx.session.userId,
      },
      select: {
        id: true,
      },
    });

    if (!artifact) {
      throw new TRPCError({
        message: 'Artifact does not exist or is not owned by current user',
        code: 'FORBIDDEN',
      });
    }

    await prisma.artifactShare.deleteMany({
      where: {
        artifactId: input.artifactId,
        userId: input.userId,
      },
    });

    await prisma.artifactPin.deleteMany({
      where: {
        artifactId: input.artifactId,
        userId: input.userId,
      },
    });

    return 'Ok';
  });
