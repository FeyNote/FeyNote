import { authenticatedHocuspocusTrpcProcedure } from '../../middleware/authenticatedHocuspocusTrpcProcedure';
import { z } from 'zod';
import {
  getMetaFromYArtifact,
  getUserAccessFromYArtifact,
} from '@feynote/shared-utils';
import { TRPCError } from '@trpc/server';
import { logger } from '../../../logging/logger';

export const removeUserAccessToDoc = authenticatedHocuspocusTrpcProcedure
  .input(
    z.object({
      userId: z.string().uuid(),
      documentName: z.string(),
    }),
  )
  .mutation(async (args): Promise<string> => {
    const connection = await args.ctx.hocuspocus.openDirectConnection(
      args.input.documentName,
      {},
    );

    await connection.transact((yDoc) => {
      const yArtifactMeta = getMetaFromYArtifact(yDoc);

      if (args.input.userId === yArtifactMeta.userId) {
        logger.warn(
          `Owner of document attempted to remove themselves: ${args.input.documentName} ${args.input.userId}`,
        );

        throw new TRPCError({
          message:
            'Owner of document cannot remove themselves as a collaborator',
          code: 'BAD_REQUEST',
        });
      }

      const userAccess = getUserAccessFromYArtifact(yDoc);
      userAccess.delete(args.input.userId);
    });

    await connection.disconnect();

    return 'Ok';
  });
