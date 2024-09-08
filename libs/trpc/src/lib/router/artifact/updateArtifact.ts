import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';

export const updateArtifact = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        userId: true,
        yBin: true,
      },
    });

    if (!artifact || artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact does not exist or is not visible to current user',
        code: 'FORBIDDEN',
      });
    }

    await prisma.artifact.update({
      where: {
        id: input.id,
      },
      data: {},
    });

    await enqueueArtifactUpdate({
      artifactId: artifact.id,
      userId: ctx.session.userId,
      oldYBinB64: artifact.yBin.toString('base64'),
      newYBinB64: artifact.yBin.toString('base64'),
    });

    // We do not return the complete artifact, but rather expect that the frontend will
    // fetch the complete artifact via getArtifactById
    return 'Ok';
  });
