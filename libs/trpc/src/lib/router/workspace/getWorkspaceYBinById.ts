import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import { ArtifactAccessLevel } from '@prisma/client';

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
          workspaceShares: {
            select: {
              userId: true,
              accessLevel: true,
            },
          },
        },
      });

      if (!workspace) {
        throw new TRPCError({
          message:
            'Workspace does not exist or is not visible to the current user',
          code: 'NOT_FOUND',
        });
      }

      const isOwner = workspace.userId === ctx.session?.userId;
      const hasShare = workspace.workspaceShares.some(
        (s) =>
          s.userId === ctx.session?.userId &&
          s.accessLevel !== ArtifactAccessLevel.noaccess,
      );

      if (!isOwner && !hasShare) {
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
