import {
  getArtifactsByIds,
  getArtifactsForUserId,
} from '@dnd-assistant/api-services';
import { searchArtifacts } from '@dnd-assistant/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';

export const getArtifactsForSelf = authenticatedProcedure
  .input(
    z.object({
      query: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { session } = ctx;
    const { query } = input;
    if (query) {
      const searchedArtifactIds = await searchArtifacts(session.userId, query);
      const artifacts = await getArtifactsByIds(searchedArtifactIds);
      return artifacts;
    }
    const artifacts = await getArtifactsForUserId(session.userId);
    return artifacts;
  });
