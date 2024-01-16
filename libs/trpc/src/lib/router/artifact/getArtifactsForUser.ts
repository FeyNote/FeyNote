import { getArtifactsForUserId } from '@dnd-assistant/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';

export const getArtifactsForUser = authenticatedProcedure.query(
  async (opts) => {
    const { session } = opts.ctx;
    const artifacts = await getArtifactsForUserId(session.userId);
    return artifacts;
  }
);
