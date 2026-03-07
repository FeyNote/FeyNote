import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { publicProcedure } from '../../trpc';
import { getWorkspaceAccessLevel as getWorkspaceAccessLevelUtil } from '@feynote/shared-utils';
import type { ArtifactAccessLevel } from '@prisma/client';

export const getWorkspaceAccessLevel = publicProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(
    async ({
      ctx,
      input,
    }): Promise<{
      accessLevel: ArtifactAccessLevel;
    }> => {
      if (!ctx.session) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });
      }

      const { userId } = ctx.session;

      const workspace = await prisma.workspace.findUnique({
        where: {
          id: input.id,
        },
        select: {
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

      if (!workspace) {
        throw new TRPCError({
          message: 'Workspace does not exist',
          code: 'NOT_FOUND',
        });
      }

      return {
        accessLevel: getWorkspaceAccessLevelUtil(workspace, userId),
      };
    },
  );
