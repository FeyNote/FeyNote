import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import {
  getWorkspaceAccessLevel,
  getArtifactAccessLevel,
} from '@feynote/shared-utils';
import { artifactSnapshot } from '@feynote/prisma/types';
import { prismaArtifactSnapshotToArtifactSnapshot } from '@feynote/api-services';
import type { ArtifactSnapshot } from '@feynote/global-types';

export const getArtifactSnapshotsByWorkspaceId = publicProcedure
  .input(
    z.object({
      workspaceId: z.uuid(),
    }),
  )
  .query(async ({ input, ctx }): Promise<ArtifactSnapshot[]> => {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: input.workspaceId,
      },
      select: {
        userId: true,
        linkAccessLevel: true,
        deletedAt: true,
        workspaceShares: {
          select: {
            userId: true,
            accessLevel: true,
          },
        },
        workspaceArtifacts: {
          select: {
            artifact: {
              ...artifactSnapshot,
            },
          },
        },
      },
    });

    if (!workspace || workspace.deletedAt) {
      throw new TRPCError({
        message:
          'Workspace does not exist or is not visible to the current user',
        code: 'NOT_FOUND',
      });
    }

    if (
      getWorkspaceAccessLevel(workspace, ctx.session?.userId) === 'noaccess'
    ) {
      throw new TRPCError({
        message:
          'Workspace does not exist or is not visible to the current user',
        code: 'NOT_FOUND',
      });
    }

    return workspace.workspaceArtifacts
      .map((wa) => wa.artifact)
      .filter((artifact) => !artifact.deletedAt)
      .filter(
        (artifact) =>
          getArtifactAccessLevel(artifact, ctx.session?.userId) !== 'noaccess',
      )
      .map(prismaArtifactSnapshotToArtifactSnapshot);
  });
