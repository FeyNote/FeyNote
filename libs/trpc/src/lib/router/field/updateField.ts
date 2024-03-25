import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { TRPCError } from '@trpc/server';
import { prisma } from '@dnd-assistant/prisma/client';
import { ArtifactFieldInputSchema } from './types';
import { createArtifactFieldData } from './createArtifactFieldData';
import { FieldType } from '@prisma/client';

export const updateField = authenticatedProcedure
  .input(ArtifactFieldInputSchema)
  .mutation(async ({ ctx, input }) => {
    const field = await prisma.artifactField.findUnique({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        type: true,
        artifact: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!field) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }

    if (field.artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'You do not own this field',
        code: 'FORBIDDEN',
      });
    }

    const fieldType = input.type || field.type;

    if (fieldType === FieldType.Text && input.imageIds) {
      throw new TRPCError({
        message: 'Text fields cannot have associated images',
        code: 'BAD_REQUEST',
      });
    }

    if (fieldType === FieldType.Images && input.text) {
      throw new TRPCError({
        message: 'Image fields cannot have an associated text block',
        code: 'BAD_REQUEST',
      });
    }

    if (input.imageIds) {
      await prisma.artifactImage.deleteMany({
        where: {
          artifactFieldId: input.id,
        },
      });

      await prisma.artifactImage.createMany({
        data: input.imageIds.map((imageId, idx) => ({
          artifactFieldId: input.id,
          imageId,
          order: idx,
        })),
      });
    }

    const data = createArtifactFieldData(input);

    await prisma.artifactField.update({
      where: {
        id: input.id,
      },
      data,
    });

    return;
  });
