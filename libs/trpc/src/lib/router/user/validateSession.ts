import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';

export const validateSession = authenticatedProcedure.query(
  async ({
    ctx,
  }): Promise<{
    expiresAt: Date;
  }> => {
    return {
      expiresAt: ctx.session.expiresAt,
    };
  },
);
