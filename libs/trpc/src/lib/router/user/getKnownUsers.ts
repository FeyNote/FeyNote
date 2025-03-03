import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const getKnownUsers = authenticatedProcedure.query(
  async ({
    ctx,
  }): Promise<
    {
      id: string;
      name: string;
      email: string;
    }[]
  > => {
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

    const sharingWithMe = await prisma.artifactShare.findMany({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        artifact: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const results = [
      ...artifactShares.map((artifactShare) => artifactShare.user),
      ...sharingWithMe.map((artifactShare) => artifactShare.artifact.user),
    ];

    const knownUsers = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
      }
    >();

    for (const user of results) {
      knownUsers.set(user.id, user);
    }

    return Array.from(knownUsers.values());
  },
);
