import { getAllByUserId } from '@dnd-assistant/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';

export const getAllForUser = authenticatedProcedure.query(async (opts) => {
  const { session } = opts.ctx;
  const artifacts = await getAllByUserId(session.userId);
  return artifacts;
});
