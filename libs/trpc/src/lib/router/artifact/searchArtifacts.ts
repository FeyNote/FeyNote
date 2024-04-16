import { getArtifactSummariesByIds } from '@feynote/api-services';
import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';

export const searchArtifacts = authenticatedProcedure
  .input(
    z.object({
      query: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const searchedArtifactIds = await searchProvider.searchArtifacts(
      ctx.session.userId,
      input.query,
      true
    );

    const artifacts = await getArtifactSummariesByIds(searchedArtifactIds);

    return artifacts;
  });
