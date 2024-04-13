import { getArtifactDetailById } from '@dnd-assistant/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@dnd-assistant/prisma/client';
import { searchProvider } from '@dnd-assistant/search';
import { artifactJsonSchema } from '@dnd-assistant/prisma/types';

export const updateArtifact = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string(),
      text: z.string(),
      json: artifactJsonSchema,
    })
  )
  .mutation(async ({ ctx, input }) => {
    const artifact = await getArtifactDetailById(input.id);

    if (artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact not visible to current user',
        code: 'FORBIDDEN',
      });
    }

    await prisma.artifact.update({
      where: {
        id: input.id,
      },
      data: {
        title: input.title,
        text: input.text,
        json: input.json,
      },
    });

    await searchProvider.indexArtifacts([input.id]);

    // We do not return the complete artifact, but rather expect that the frontend will
    // fetch the complete artifact via getArtifactById
    return 'Ok';
  });
