import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { searchProvider } from '@feynote/search';
import { artifactJsonSchema } from '@feynote/prisma/types';
import { getBlockReferences } from '@feynote/shared-utils';
import { TRPCError } from '@trpc/server';

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

    const artifactReferences = input.json.blocknoteContent
      ? getBlockReferences(input.json.blocknoteContent)
      : [];

    const referencedArtifacts = await prisma.artifact.findMany({
      where: {
        id: {
          in: artifactReferences.map((reference) => reference.artifactId),
        },
      },
    });

    if (
      referencedArtifacts.some(
        (referencedArtifact) =>
          referencedArtifact.userId !== ctx.session.userId,
      )
    ) {
      throw new TRPCError({
        message:
          'You do not own one of the artifacts referenced in your query.',
        code: 'FORBIDDEN',
      });
    }

    const { id } = await prisma.artifact.create({
      data: {
        title: input.title,
        text: input.text,
        json: input.json,
        userId: ctx.session.userId,
        isPinned: input.isPinned,
        isTemplate: input.isTemplate,
        rootTemplateId: input.rootTemplateId,
        artifactTemplateId: input.artifactTemplateId,
        referencedArtifacts: {
          createMany: {
            data: artifactReferences.map((reference) => ({
              referencedArtifactId: reference.artifactId,
              referencedArtifactBlockId: reference.artifactBlockId,
            })),
          },
        },
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
