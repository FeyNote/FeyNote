import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { ArtifactAccessLevel } from '@prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';

export const upsertArtifactShare = authenticatedProcedure
  .input(
    z.object({
      artifactId: z.string(),
      userId: z.string(),
      accessLevel: z.nativeEnum(ArtifactAccessLevel),
    }),
  )
  .mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      id: string;
    }> => {
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

      const artifactShare = await prisma.$transaction(async (tx) => {
        const existingShare = await tx.artifactShare.findFirst({
          where: {
            artifactId: input.artifactId,
            userId: input.userId,
          },
          select: {
            id: true,
          },
        });

        const artifactShare = await tx.artifactShare.upsert({
          where: {
            id: existingShare?.id || '00000000-0000-0000-0000-000000000000', // Prisma requires that a field be passed - this will never match a real UUID
          },
          update: {
            accessLevel: input.accessLevel,
          },
          create: {
            artifactId: input.artifactId,
            userId: input.userId,
            accessLevel: input.accessLevel,
          },
          select: {
            id: true,
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

        return artifactShare;
      });

      return artifactShare;
    },
  );
