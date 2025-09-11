import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { hocuspocusTrpcClient } from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { TRPCClientError } from '@trpc/client';

export const removeSelfAsCollaborator = authenticatedProcedure
  .input(
    z.object({
      artifactId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.artifactId,
      },
    });

    if (!artifact) {
      throw new TRPCError({
        message: 'Artifact does not exist',
        code: 'NOT_FOUND',
      });
    }

    await hocuspocusTrpcClient.doc.removeUserAccessToDoc.mutate({
      userId: ctx.session.userId,
      documentName: `artifact:${input.artifactId}`,
    }).catch((e) => {
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
