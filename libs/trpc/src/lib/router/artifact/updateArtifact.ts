import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';

export const updateArtifact = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        userId: true,
        yBin: true,
        artifactShares: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!artifact || artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact does not exist or is not visible to current user',
        code: 'FORBIDDEN',
      });
    }

    await prisma.$transaction(async (tx) => {
      await prisma.artifact.update({
        where: {
          id: input.id,
        },
        data: {},
      });

      const updatedArtifact = await prisma.artifact.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          userId: true,
          yBin: true,
          artifactShares: {
            select: {
              userId: true,
            },
          },
        },
      });

      await enqueueArtifactUpdate({
        artifactId: artifact.id,
        userId: artifact.userId,
        triggeredByUserId: ctx.session.userId,
        oldReadableUserIds: [
          artifact.userId,
          ...artifact.artifactShares.map((el) => el.userId),
        ],
        newReadableUserIds: [
          updatedArtifact.userId,
          ...updatedArtifact.artifactShares.map((el) => el.userId),
        ],
        oldYBinB64: Buffer.from(artifact.yBin).toString('base64'),
        newYBinB64: Buffer.from(updatedArtifact.yBin).toString('base64'),
      });
    });

    // We do not return the complete artifact, but rather expect that the frontend will
    // fetch the complete artifact via getArtifactById
    return 'Ok';
  });
