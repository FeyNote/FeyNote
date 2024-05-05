import { getArtifactDetailById } from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { searchProvider } from '@feynote/search';
import { artifactJsonSchema } from '@feynote/prisma/types';
import { getBlockReferences } from '@feynote/shared-utils';

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
      artifactTemplateId: z.string().nullable(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const artifact = await getArtifactDetailById(input.id);

    if (artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact not visible to current user',
        code: 'FORBIDDEN',
      });
    }

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

    await prisma.artifactReference.deleteMany({
      where: {
        artifactId: input.id,
      },
    });

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
