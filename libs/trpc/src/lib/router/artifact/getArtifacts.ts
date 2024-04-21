import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { artifactSummary } from '@feynote/prisma/types';

export const getArtifacts = authenticatedProcedure
  .input(
    z.object({
      isTemplate: z.boolean().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { session } = ctx;

    const artifacts = await prisma.artifact.findMany({
      where: {
        userId: session.userId,
        isTemplate: input.isTemplate,
      },
      ...artifactSummary,
      orderBy: [
        {
          title: 'desc',
        },
      ],
    });

    return artifacts;
  });
