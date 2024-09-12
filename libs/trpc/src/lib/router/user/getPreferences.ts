import { AppPreferences } from '@feynote/shared-utils';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const getPreferences = authenticatedProcedure.query(
  async ({ ctx }): Promise<AppPreferences | null> => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.session.userId,
      },
      select: {
        preferences: true,
      },
    });

    // Cast to unknown since there is no good way of typing prisma json fields
    // Field is optional, so nullable
    const preferences = user.preferences as unknown as AppPreferences | null;

    return preferences;
  },
);
