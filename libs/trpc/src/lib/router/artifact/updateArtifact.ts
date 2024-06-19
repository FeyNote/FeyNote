import {
  createArtifactRevision,
  updateArtifactBlockReferenceText,
  updateArtifactOutgoingReferences,
  updateArtifactReferenceText,
} from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { searchProvider } from '@feynote/search';
import {
  ArtifactJson,
  artifactDetail,
  artifactJsonSchema,
} from '@feynote/prisma/types';
import { ArtifactTheme } from '@prisma/client';

export const updateArtifact = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string(),
      text: z.string(),
      json: artifactJsonSchema,
      theme: z.nativeEnum(ArtifactTheme),
      isPinned: z.boolean(),
      isTemplate: z.boolean(),
      rootTemplateId: z.string().nullable(),
      artifactTemplateId: z.string().nullable(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
      ...artifactDetail,
    });

    if (!artifact || artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact does not exist or is not visible to current user',
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

    await prisma.$transaction(async (tx) => {
      await updateArtifactReferenceText(
        input.id,
        artifact.title,
        input.title,
        tx,
      );
      await updateArtifactBlockReferenceText(
        input.id,
        (artifact.json as ArtifactJson).blocknoteContent || [],
        input.json.blocknoteContent || [],
        tx,
      );
      await updateArtifactOutgoingReferences(
        ctx.session.userId,
        input.id,
        input.json.blocknoteContent || [],
        tx,
      );

      await createArtifactRevision(input.id, tx);

      await tx.artifact.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          text: input.text,
          json: input.json,
          theme: input.theme,
          isPinned: input.isPinned,
          isTemplate: input.isTemplate,
          rootTemplateId: input.rootTemplateId,
        },
      });
    });

    const indexableArtifact = {
      id: artifact.id,
      userId: ctx.session.userId,
      text: input.text,
      title: input.title,
      json: input.json,
    };

    // Fire index async
    searchProvider.indexArtifact(indexableArtifact).catch((e) => {
      console.error(e);
      // TODO: fire sentry here
    });

    // We do not return the complete artifact, but rather expect that the frontend will
    // fetch the complete artifact via getArtifactById
    return 'Ok';
  });
