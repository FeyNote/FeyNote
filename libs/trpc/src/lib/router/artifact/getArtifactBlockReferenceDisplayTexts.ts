import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';

export const getArtifactBlockReferenceDisplayTexts = authenticatedProcedure
  .input(
    z.object({
      identifiers: z.array(
        z.object({
          artifactId: z.string(),
          artifactBlockId: z.string(),
        }),
      ),
    }),
  )
  .query(async ({ input, ctx }) => {
    // TODO: We may want userId on the displayText table
    const displayTexts =
      await prisma.artifactBlockReferenceDisplayText.findMany({
        where: {
          OR: input.identifiers.map((identifier) => ({
            artifactId: identifier.artifactId,
            artifactBlockId: identifier.artifactBlockId,
          })),
        },
        select: {
          artifactId: true,
          artifactBlockId: true,
          displayText: true,
        },
      });

    return displayTexts;
  });
