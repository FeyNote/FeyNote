import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail, artifactJsonSchema } from '@feynote/prisma/types';
import { ArtifactTheme } from '@prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';

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

    await prisma.artifact.update({
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

    await enqueueArtifactUpdate({
      artifactId: artifact.id,
      userId: ctx.session.userId,
      oldYBin: artifact.yBin,
      newYBin: artifact.yBin,
    });

    // We do not return the complete artifact, but rather expect that the frontend will
    // fetch the complete artifact via getArtifactById
    return 'Ok';
  });
