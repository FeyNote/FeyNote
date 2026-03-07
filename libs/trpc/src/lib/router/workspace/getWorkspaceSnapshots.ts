import type { WorkspaceSnapshot } from '@feynote/global-types';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { workspaceSnapshot } from '@feynote/prisma/types';
import { ArtifactAccessLevel } from '@prisma/client';
import { prismaWorkspaceSnapshotToWorkspaceSnapshot } from '@feynote/api-services';

const includedAccessLevels = [
  ArtifactAccessLevel.coowner,
  ArtifactAccessLevel.readwrite,
  ArtifactAccessLevel.readonly,
];

export const getWorkspaceSnapshots = authenticatedProcedure.query(
  async ({ ctx }): Promise<WorkspaceSnapshot[]> => {
    const [ownedWorkspaces, sharedWorkspaces] = await Promise.all([
      prisma.workspace.findMany({
        where: {
          userId: ctx.session.userId,
          deletedAt: null,
        },
        ...workspaceSnapshot,
      }),
      prisma.workspace.findMany({
        where: {
          deletedAt: null,
          workspaceShares: {
            some: {
              OR: includedAccessLevels.map((el) => ({
                userId: ctx.session.userId,
                accessLevel: el,
              })),
            },
          },
        },
        ...workspaceSnapshot,
      }),
    ]);

    const workspaces = [...ownedWorkspaces, ...sharedWorkspaces];

    const results = new Map<string, WorkspaceSnapshot>();
    for (const workspace of workspaces) {
      results.set(
        workspace.id,
        prismaWorkspaceSnapshotToWorkspaceSnapshot(workspace),
      );
    }

    return [...results.values()];
  },
);
