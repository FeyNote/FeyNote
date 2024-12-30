import { getCapabilitiesForUser } from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { Capability } from '@feynote/shared-utils';

export const getCapabilities = authenticatedProcedure.query(
  async ({
    ctx,
  }): Promise<{
    capabilities: Capability[];
  }> => {
    const capabilitiesForUser = await getCapabilitiesForUser(
      ctx.session.userId,
    );

    return {
      capabilities: Array.from(capabilitiesForUser),
    };
  },
);
