import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { artifactSnapshot } from '@feynote/prisma/types';
import { type ArtifactSnapshot } from '@feynote/global-types';
import { prismaArtifactSnapshotToArtifactSnapshot } from '@feynote/api-services';
import { getArtifactAccessLevel } from '@feynote/shared-utils';
import { publicProcedure } from '../../trpc';

export const getArtifactSnapshotById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx, input }): Promise<ArtifactSnapshot> => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
      ...artifactSnapshot,
    });

    if (
      !artifact ||
      getArtifactAccessLevel(artifact, ctx.session?.userId) === 'noaccess'
    ) {
      throw new TRPCError({
        message:
          'Artifact does not exist or is not visible to the current user',
        code: 'NOT_FOUND',
      });
    }

    return prismaArtifactSnapshotToArtifactSnapshot(artifact);
  });
