import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { ArtifactDTO } from '@feynote/global-types';
import {
  artifactDetailToArtifactDTO,
  getArtifactAccessLevel,
} from '@feynote/api-services';
import { publicProcedure } from '../../trpc';
import { ArtifactAccessLevel } from '@prisma/client';

export const getArtifactById = publicProcedure
  .input(
    z.object({
      id: z.string(),
      shareToken: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }): Promise<ArtifactDTO> => {
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

    if (!artifact) {
      throw new TRPCError({
        message: 'Artifact does not exist',
        code: 'NOT_FOUND',
      });
    }

    const accessLevel = await getArtifactAccessLevel({
      currentUserId: ctx.session?.userId,
      artifact: artifact.id,
    });

    if (accessLevel === ArtifactAccessLevel.noaccess) {
      throw new TRPCError({
        message: 'You do not have rights to view this artifact',
        code: 'NOT_FOUND',
      });
    }

    return artifactDetailToArtifactDTO(ctx.session?.userId, artifact);
  });
