import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';

export const deleteArtifactShare = authenticatedProcedure
  .input(
    z.object({
      artifactId: z.string(),
      userId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.artifactId,
        userId: ctx.session.userId,
      },
      select: {
        id: true,
        userId: true,
        artifactShares: {
          select: {
            userId: true,
          },
        },
        yBin: true,
      },
    });

    if (!artifact) {
      throw new TRPCError({
        message: 'Artifact does not exist or is not owned by current user',
        code: 'FORBIDDEN',
      });
    }

    await prisma.$transaction(async (tx) => {
      await prisma.artifactShare.deleteMany({
        where: {
          artifactId: input.artifactId,
          userId: input.userId,
        },
      });

      await prisma.artifactPin.deleteMany({
        where: {
          artifactId: input.artifactId,
          userId: input.userId,
        },
      });

      const updatedArtifact = await tx.artifact.findUniqueOrThrow({
        where: {
          id: input.artifactId,
          userId: ctx.session.userId,
        },
        select: {
          id: true,
          userId: true,
          artifactShares: {
            select: {
              userId: true,
            },
          },
          yBin: true,
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
        oldYBinB64: artifact.yBin.toString('base64'),
        newYBinB64: updatedArtifact.yBin.toString('base64'),
      });
    });

    return 'Ok';
  });
