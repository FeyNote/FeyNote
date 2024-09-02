import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';
import { artifactJsonSchema } from '@feynote/prisma/types';
import { TRPCError } from '@trpc/server';
import { ArtifactTheme, ArtifactType } from '@prisma/client';
import { encodeStateAsUpdate } from 'yjs';
import { constructYArtifact } from '@feynote/shared-utils';

export const createArtifact = authenticatedProcedure
  .input(
    z.object({
      id: z.string().uuid().optional(),
      title: z.string(),
      type: z.nativeEnum(ArtifactType),
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

    const yDoc = constructYArtifact({
      title: input.title,
      theme: input.theme,
      type: input.type,
    });
    const yBin = Buffer.from(encodeStateAsUpdate(yDoc));

    const { id } = await prisma.artifact.create({
      data: {
        id: input.id,
        title: input.title,
        type: input.type,
        text: input.text,
        json: input.json,
        userId: ctx.session.userId,
        theme: input.theme,
        isPinned: input.isPinned,
        isTemplate: input.isTemplate,
        rootTemplateId: input.rootTemplateId,
        artifactTemplateId: input.artifactTemplateId,
        yBin,
      },
    });

    await enqueueArtifactUpdate({
      artifactId: id,
      userId: ctx.session.userId,
      oldYBinB64: yBin.toString('base64'),
      newYBinB64: yBin.toString('base64'),
    });

    // We only return ID since we expect frontend to fetch artifact via getArtifactById
    // rather than adding that logic here.
    return {
      id,
    };
  });
