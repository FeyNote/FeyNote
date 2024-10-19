import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { ArtifactAccessLevel } from '@prisma/client';
import { randomBytes } from 'crypto';

const FILE_NAME_BYTES = 15;

export const createFile = authenticatedProcedure
  .input(
    z.object({
      artifactId: z.string(),
      allowAddToAccount: z.boolean(),
      accessLevel: z.nativeEnum(ArtifactAccessLevel),
      expiresAt: z.date().optional(),
    }),
  )
  .mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      id: string;
    }> => {
      //await prisma.file.create({
      //  data: {
      //    id: randomBytes(FILE_NAME_BYTES).toString('hex'),
      //  },
      //});

      return {
        id: 'asdf',
      };
    },
  );
