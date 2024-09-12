import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const getKnownUsers = authenticatedProcedure.query(async ({ ctx }) => {
  const artifactShares = await prisma.artifactShare.findMany({
    where: {
      artifact: {
        userId: ctx.session.userId,
      },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const knownUsers = artifactShares.map((artifactShare) => artifactShare.user);

  return knownUsers;
});
