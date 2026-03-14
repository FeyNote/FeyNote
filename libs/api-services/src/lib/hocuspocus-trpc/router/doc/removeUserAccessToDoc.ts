import { authenticatedHocuspocusTrpcProcedure } from '../../middleware/authenticatedHocuspocusTrpcProcedure';
import { z } from 'zod';
import {
  getMetaFromYArtifact,
  getUserAccessFromYArtifact,
  getWorkspaceMetaFromYDoc,
  getWorkspaceUserAccessFromYDoc,
} from '@feynote/shared-utils';
import { TRPCError } from '@trpc/server';
import { logger } from '../../../logging/logger';
import { splitDocumentName } from '../../../hocuspocus/splitDocumentName';
import { SupportedDocumentType } from '../../../hocuspocus/SupportedDocumentType';

export const removeUserAccessToDoc = authenticatedHocuspocusTrpcProcedure
  .input(
    z.object({
      userId: z.string().uuid(),
      documentName: z.string(),
    }),
  )
  .mutation(async (args): Promise<string> => {
    const [type] = splitDocumentName(args.input.documentName);

    if (type === SupportedDocumentType.UserTree) {
      throw new TRPCError({
        message: 'Cannot remove user access from a user tree',
        code: 'BAD_REQUEST',
      });
    }

    const connection =
      await args.ctx.hocuspocusServer.hocuspocus.openDirectConnection(
        args.input.documentName,
        {},
      );

    await connection.transact((yDoc) => {
      let ownerId: string | undefined;
      switch (type) {
        case SupportedDocumentType.Artifact: {
          ownerId = getMetaFromYArtifact(yDoc).userId;
          break;
        }
        case SupportedDocumentType.Workspace: {
          ownerId = getWorkspaceMetaFromYDoc(yDoc).userId;
          break;
        }
      }

      if (args.input.userId === ownerId) {
        logger.warn(
          `Owner of document attempted to remove themselves: ${args.input.documentName} ${args.input.userId}`,
        );

        throw new TRPCError({
          message:
            'Owner of document cannot remove themselves as a collaborator',
          code: 'BAD_REQUEST',
        });
      }

      switch (type) {
        case SupportedDocumentType.Artifact: {
          getUserAccessFromYArtifact(yDoc).delete(args.input.userId);
          break;
        }
        case SupportedDocumentType.Workspace: {
          getWorkspaceUserAccessFromYDoc(yDoc).delete(args.input.userId);
          break;
        }
      }
    });

    await connection.disconnect();

    return 'Ok';
  });
