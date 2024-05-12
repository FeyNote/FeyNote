import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { searchProvider } from '@feynote/search';
import { artifactJsonSchema } from '@feynote/prisma/types';
import { TRPCError } from '@trpc/server';
import { updateArtifactOutgoingReferences } from '@feynote/api-services';

export const createArtifact = authenticatedProcedure
  .input(
    z.object({
      title: z.string(),
      text: z.string(),
      json: artifactJsonSchema,
      isPinned: z.boolean(),
      isTemplate: z.boolean(),
      rootTemplateId: z.string().nullable(),
      artifactTemplateId: z.string().nullable(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    if (input.artifactTemplateId) {
      const template = await prisma.artifact.findUnique({
        where: {
          id: input.artifactTemplateId,
        },
      });

      if (!template || template.userId !== ctx.session.userId) {
        throw new TRPCError({
          message:
            'Passed artifactTemplateId is not owned by the current user, or does not exist',
          code: 'FORBIDDEN',
        });
      }
    }

    const id = await prisma.$transaction(async (tx) => {
      const { id } = await tx.artifact.create({
        data: {
          title: input.title,
          text: input.text,
          json: input.json,
          userId: ctx.session.userId,
          isPinned: input.isPinned,
          isTemplate: input.isTemplate,
          rootTemplateId: input.rootTemplateId,
          artifactTemplateId: input.artifactTemplateId,
        },
      });

      await updateArtifactOutgoingReferences(
        ctx.session.userId,
        id,
        [],
        input.json.blocknoteContent || [],
        tx,
      );

      return id;
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
