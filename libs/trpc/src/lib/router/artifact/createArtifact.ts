import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { searchProvider } from '@feynote/search';
import { artifactJsonSchema } from '@feynote/prisma/types';

export const createArtifact = authenticatedProcedure
  .input(
    z.object({
      title: z.string(),
      text: z.string(),
      json: artifactJsonSchema,
      isPinned: z.boolean(),
      isTemplate: z.boolean(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { id } = await prisma.artifact.create({
      data: {
        title: input.title,
        text: input.text,
        json: input.json,
        userId: ctx.session.userId,
        isPinned: input.isPinned,
        isTemplate: input.isTemplate,
      },
    });

    const indexableArtifact = {
      id,
      userId: ctx.session.userId,
      text: input.text,
      title: input.title,
      json: input.json,
    };

    await searchProvider.indexArtifact(indexableArtifact);

    // We only return ID since we expect frontend to fetch artifact via getArtifactById
    // rather than adding that logic here.
    return {
      id,
    };
  });
