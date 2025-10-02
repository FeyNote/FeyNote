import { type Edge } from '@feynote/shared-utils';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { getManifest } from '@feynote/api-services';

export const getArtifactEdges = authenticatedProcedure.query(
  async ({ ctx }): Promise<Edge[]> => {
    const manifest = await getManifest(ctx.session.userId);

    return manifest.edges;
  },
);
