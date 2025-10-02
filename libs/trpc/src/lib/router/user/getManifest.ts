import { Manifest } from '@feynote/shared-utils';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { getManifest as _getManifest } from '@feynote/api-services';

export const getManifest = authenticatedProcedure.query(
  async ({ ctx }): Promise<Manifest> => {
    return _getManifest(ctx.session.userId);
  },
);
