import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { ArtifactDTO } from '@feynote/global-types';
import {
  artifactDetailToArtifactDTO,
  hasArtifactAccess,
} from '@feynote/api-services';
import { publicProcedure } from '../../trpc';

export const getArtifactReferencesById = publicProcedure
  .input(
    z.object({
      id: z.string(),
      shareToken: z.string().optional(),
    }),
  )
  .query(
    async ({
      ctx,
      input,
    }): Promise<{
      artifactReferences: ArtifactDTO['artifactReferences'];
      incomingArtifactReferences: ArtifactDTO['incomingArtifactReferences'];
    }> => {
      if (!ctx.session && !input.shareToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });
      }

      const artifact = await prisma.artifact.findUnique({
        where: {
          id: input.id,
        },
        ...artifactDetail,
      });

      if (
        !artifact ||
        !hasArtifactAccess(artifact, ctx.session?.userId, input.shareToken)
      ) {
        throw new TRPCError({
          message:
            'Artifact does not exist or is not visible to the current user',
          code: 'NOT_FOUND',
        });
      }

      const artifactDTO = artifactDetailToArtifactDTO(
        ctx.session?.userId,
        artifact,
      );

      return {
        artifactReferences: artifactDTO.artifactReferences,
        incomingArtifactReferences: artifactDTO.incomingArtifactReferences,
      };
    },
  );
