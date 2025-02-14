import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactCollectionUpdate } from '@feynote/queue';
import { Doc as YDoc, encodeStateAsUpdate } from 'yjs';

export const upsertArtifactCollection = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
      yBin: z.any(),
    }),
  )
  .mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      id: string;
    }> => {
      const artifactCollection = await prisma.artifactCollection.findFirst({
        where: {
          id: input.id,
        },
      });

      if (artifactCollection) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An artifact collection with this ID already exists',
        });
      }

      await prisma.artifactCollection.create({
        data: {
          id: input.id,
          title: '',
          treeYBin: input.yBin,
        },
      });

      await enqueueArtifactCollectionUpdate({
        artifactCollectionId: input.id,
        triggeredByUserId: ctx.session.userId,
        oldYBinB64: Buffer.from(encodeStateAsUpdate(new YDoc())).toString(
          'base64',
        ),
        newYBinB64: Buffer.from(input.yBin).toString('base64'),
      });

      return {
        id: input.id,
      };
    },
  );
