import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';

export const deleteArtifactShareToken = authenticatedProcedure
  .input(
    z.union([
      z.object({
        id: z.string(),
      }),
      z.object({
        token: z.string(),
      }),
    ]),
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
    const artifactShareToken = await prisma.artifactShareToken.findFirst({
      where: {
        id: 'id' in input ? input.id : undefined,
        shareToken: 'token' in input ? input.token : undefined,
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

    if (
      !artifactShareToken ||
      artifactShareToken.artifact.userId !== ctx.session.userId
    ) {
      throw new TRPCError({
        message: 'Artifact does not exist or is not owned by current user',
        code: 'FORBIDDEN',
      });
    }

    await prisma.artifactShareToken.delete({
      where: {
        id: artifactShareToken.id,
      },
    });

    return 'Ok';
  });
