import { getArtifactSummariesByIds } from '@dnd-assistant/api-services';
import { searchProvider } from '@dnd-assistant/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';

export const searchArtifactsForSelf = authenticatedProcedure
  .input(
    z.object({
      query: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { session } = ctx;
    const { query } = input;
    const searchedArtifactIds = await searchProvider.searchArtifacts(
      session.userId,
      query,
      true
    );
    const artifacts = await getArtifactSummariesByIds(searchedArtifactIds);
    return artifacts;
  });
