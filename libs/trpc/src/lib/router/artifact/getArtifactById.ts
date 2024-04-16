import { getArtifactDetailById } from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const getArtifactById = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const artifact = await getArtifactDetailById(input.id);

    if (artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact not visible to current user',
        code: 'FORBIDDEN',
      });
    }

    return artifact;
  });
