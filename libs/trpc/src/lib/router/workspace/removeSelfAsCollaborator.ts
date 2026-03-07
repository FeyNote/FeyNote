import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { hocuspocusTrpcClient } from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { TRPCClientError } from '@trpc/client';

export const removeSelfAsCollaborator = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: input.workspaceId,
      },
    });

    if (!workspace) {
      throw new TRPCError({
        message: 'Workspace does not exist',
        code: 'NOT_FOUND',
      });
    }

    await hocuspocusTrpcClient.doc.removeUserAccessToDoc
      .mutate({
        userId: ctx.session.userId,
        documentName: `workspace:${input.workspaceId}`,
      })
      .catch((e) => {
        if (e instanceof TRPCClientError) {
          if (e.data?.httpStatus === 400) {
            throw new TRPCError({
              message: e.message,
              code: 'BAD_REQUEST',
            });
          }
        }

        throw e;
      });

    return 'Ok';
  });
