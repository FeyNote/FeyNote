import { getArtifactById as _getArtifactById } from '@dnd-assistant/api-services';
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
    const artifact = await _getArtifactById(input.id);

    // TODO: We will want to check visibility here rather than ownership only.
    if (artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact not visible to current user',
        code: 'FORBIDDEN',
      });
    }

    return artifact;
  });
