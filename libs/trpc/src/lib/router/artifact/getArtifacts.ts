import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail, type ArtifactDetail } from '@feynote/prisma/types';

const PREVIEW_TEXT_LENGTH = 150;

export const getArtifacts = authenticatedProcedure
  .input(
    z.object({
      isTemplate: z.boolean().optional(),
      isPinned: z.boolean().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { session } = ctx;

    const artifacts = await prisma.artifact.findMany({
      where: {
        userId: session.userId,
        isTemplate: input.isTemplate,
        isPinned: input.isPinned,
      },
      ...artifactDetail,
    });

    // We truncate text before sending to the client
    // since users could have thousands of artifacts with
    // very sizable contents
    artifacts.forEach((artifact) => {
      const text = artifact.text
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line)
        .join('\n')
        .replace(/\n/g, ' ');

      let truncatedText = text.substring(0, PREVIEW_TEXT_LENGTH);
      if (text.length > PREVIEW_TEXT_LENGTH) {
        truncatedText += '...';
      }

      artifact.text = truncatedText;
    });

    return artifacts as ArtifactDetail[];
  });
