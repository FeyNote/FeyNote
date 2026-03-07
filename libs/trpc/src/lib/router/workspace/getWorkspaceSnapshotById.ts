import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { workspaceSnapshot } from '@feynote/prisma/types';
import type { WorkspaceSnapshot } from '@feynote/global-types';
import { prismaWorkspaceSnapshotToWorkspaceSnapshot } from '@feynote/api-services';
import { getWorkspaceAccessLevel } from '@feynote/shared-utils';
import { publicProcedure } from '../../trpc';

export const getWorkspaceSnapshotById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx, input }): Promise<WorkspaceSnapshot> => {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: input.id,
      },
      ...workspaceSnapshot,
    });

    if (
      !workspace ||
      getWorkspaceAccessLevel(workspace, ctx.session?.userId) === 'noaccess'
    ) {
      throw new TRPCError({
        message:
          'Workspace does not exist or is not visible to the current user',
        code: 'NOT_FOUND',
      });
    }

    return prismaWorkspaceSnapshotToWorkspaceSnapshot(workspace);
  });
