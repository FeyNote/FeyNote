import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import { getWorkspaceAccessLevel } from '@feynote/shared-utils';

export const getWorkspaceYBinById = publicProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .query(
    async ({
      input,
      ctx,
    }): Promise<{
      yBin: Uint8Array;
    }> => {
      const workspace = await prisma.workspace.findUnique({
        where: {
          id: input.id,
        },
        select: {
          yBin: true,
          userId: true,
          linkAccessLevel: true,
          workspaceShares: {
            select: {
              userId: true,
              accessLevel: true,
            },
          },
        },
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

      if (!workspace.yBin) {
        throw new TRPCError({
          message: 'Workspace has no data',
          code: 'NOT_FOUND',
        });
      }

      return {
        yBin: workspace.yBin,
      };
    },
  );
