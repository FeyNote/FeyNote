import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';

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

    return 'Ok';
  });
