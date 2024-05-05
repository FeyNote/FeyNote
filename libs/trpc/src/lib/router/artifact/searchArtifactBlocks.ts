import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';

export const searchArtifactBlocks = authenticatedProcedure
  .input(
    z.object({
      query: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const matchedArtifactBlocks = await searchProvider.searchArtifactBlocks(
      ctx.session.userId,
      input.query,
    );

    return matchedArtifactBlocks;
  });
