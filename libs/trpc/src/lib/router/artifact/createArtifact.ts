import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { constructYArtifact } from '@feynote/shared-utils';
import { encodeStateAsUpdate } from 'yjs';
import { TRPCError } from '@trpc/server';

export const createArtifact = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const existingArtifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
    });
    if (existingArtifact) {
      throw new TRPCError({
        message: 'Artifact with that ID already exists',
        code: 'CONFLICT',
      });
    }

    const yDoc = constructYArtifact({
      title: '',
      theme: 'modern',
      type: 'tiptap',
    });
    const yBin = Buffer.from(encodeStateAsUpdate(yDoc));

    await prisma.artifact.create({
      data: {
        id: input.id,
        yBin,
        userId: ctx.session.userId,
      },
    });

    return 'Ok';
  });
