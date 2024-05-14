import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { artifactSummary } from '@feynote/prisma/types';

export const getArtifactReferenceDisplayTexts = authenticatedProcedure
  .input(
    z.object({
      artifactIds: z.array(z.string())
    }),
  )
  .query(async ({ input, ctx }) => {
    const displayTexts = await prisma.artifactReferenceDisplayText.findMany({
      where: {
        artifactId: {
          in: input.artifactIds
        },
      },
      select: {
        artifactId: true,
        displayText: true,
      }
    });

    return displayTexts;
  });
