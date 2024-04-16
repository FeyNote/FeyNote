import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@dnd-assistant/prisma/client';
import { searchProvider } from '@dnd-assistant/search';
import { artifactJsonSchema } from '@dnd-assistant/prisma/types';

export const createArtifact = authenticatedProcedure
  .input(
    z.object({
      title: z.string(),
      text: z.string(),
      json: artifactJsonSchema,
      isTemplate: z.boolean().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id } = await prisma.artifact.create({
      data: {
        title: input.title,
        text: input.text,
        json: input.json,
        userId: ctx.session.userId,
        isTemplate: input.isTemplate ?? false,
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
    await searchProvider.indexBlocks(indexableArtifact);

    // We only return ID since we expect frontend to fetch artifact via getArtifactById
    // rather than adding that logic here.
    return {
      id,
    };
  });
