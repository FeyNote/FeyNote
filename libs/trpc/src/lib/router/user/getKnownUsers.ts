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
    const artifactSharesPromise = prisma.artifactShare.findMany({
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

    const sharingArtifactsWithMePromise = prisma.artifactShare.findMany({
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

    const workspaceSharesPromise = prisma.workspaceShare.findMany({
      where: {
        workspace: {
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

    const sharingWorkspacesWithMePromise = prisma.workspaceShare.findMany({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        workspace: {
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

    const [
      artifactShares,
      sharingArtifactsWithMe,
      workspaceShares,
      sharingWorkspacesWithMe,
    ] = await Promise.all([
      artifactSharesPromise,
      sharingArtifactsWithMePromise,
      workspaceSharesPromise,
      sharingWorkspacesWithMePromise,
    ]);

    const results = [
      ...artifactShares.map((artifactShare) => artifactShare.user),
      ...sharingArtifactsWithMe.map(
        (artifactShare) => artifactShare.artifact.user,
      ),
      ...workspaceShares.map((artifactShare) => artifactShare.user),
      ...sharingWorkspacesWithMe.map(
        (artifactShare) => artifactShare.workspace.user,
      ),
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
