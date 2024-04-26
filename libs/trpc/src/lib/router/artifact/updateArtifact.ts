import { getArtifactDetailById } from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { searchProvider } from '@feynote/search';
import { artifactJsonSchema } from '@feynote/prisma/types';

export const updateArtifact = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string(),
      text: z.string(),
      json: artifactJsonSchema,
      isPinned: z.boolean(),
      isTemplate: z.boolean(),
      rootTemplateId: z.string().nullable(),
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
        isPinned: input.isPinned,
        isTemplate: input.isTemplate,
        rootTemplateId: input.rootTemplateId,
      },
    });

    const indexableArtifact = {
      id: artifact.id,
      userId: ctx.session.userId,
      text: input.text,
      title: input.title,
      json: input.json,
    };

    await searchProvider.indexArtifact(indexableArtifact);

    // We do not return the complete artifact, but rather expect that the frontend will
    // fetch the complete artifact via getArtifactById
    return 'Ok';
  });
