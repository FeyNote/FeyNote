import { authenticatedHocuspocusTrpcProcedure } from '../../middleware/authenticatedHocuspocusTrpcProcedure';
import { z } from 'zod';
import { getWorkspaceArtifactsFromYDoc } from '@feynote/shared-utils';

export const addArtifactsToWorkspace = authenticatedHocuspocusTrpcProcedure
  .input(
    z.object({
      workspaceId: z.string().uuid(),
      artifactIds: z.array(z.string().uuid()),
    }),
  )
  .mutation(async (args): Promise<string> => {
    const connection =
      await args.ctx.hocuspocusServer.hocuspocus.openDirectConnection(
        `workspace:${args.input.workspaceId}`,
        {},
      );

    await connection.transact((yDoc) => {
      const artifacts = getWorkspaceArtifactsFromYDoc(yDoc);
      for (const artifactId of args.input.artifactIds) {
        artifacts.set(artifactId, {});
      }
    });

    await connection.disconnect();

    return 'Ok';
  });
