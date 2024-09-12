import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';
import { artifactJsonSchema } from '@feynote/prisma/types';
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
    }),
  )
  .mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      id: string;
    }> => {
      const yDoc = constructYArtifact({
        title: input.title,
        theme: input.theme,
        type: input.type,
      });
      const yBin = Buffer.from(encodeStateAsUpdate(yDoc));

      const artifact = await prisma.artifact.create({
        data: {
          id: input.id,
          title: input.title,
          type: input.type,
          text: input.text,
          json: input.json,
          userId: ctx.session.userId,
          theme: input.theme,
          yBin,
        },
        select: {
          id: true,
          userId: true,
        },
      });

      await enqueueArtifactUpdate({
        artifactId: artifact.id,
        userId: artifact.userId,
        triggeredByUserId: ctx.session.userId,
        oldReadableUserIds: [ctx.session.userId],
        newReadableUserIds: [ctx.session.userId],
        oldYBinB64: yBin.toString('base64'),
        newYBinB64: yBin.toString('base64'),
      });

      // We only return ID since we expect frontend to fetch artifact via getArtifactById
      // rather than adding that logic here.
      return {
        id: artifact.id,
      };
    },
  );
