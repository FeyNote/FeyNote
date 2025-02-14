import { z } from 'zod';
import sharp from 'sharp';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { fileSummary } from '@feynote/prisma/types';
import {
  getArtifactAccessLevel,
  getCapabilitiesForUser,
  uploadFileToS3,
} from '@feynote/api-services';
import { ArtifactAccessLevel, FilePurpose } from '@prisma/client';
import { FileDTO } from '@feynote/global-types';
import { Capability } from '@feynote/shared-utils';

export const createFile = authenticatedProcedure
  .input(
    z.object({
      id: z.string().uuid().optional(),
      artifactId: z.string().uuid().optional(),
      name: z.string(),
      mimetype: z.string(),
      base64: z.string(),
      purpose: z.nativeEnum(FilePurpose),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<FileDTO> => {
    const id = input.id || crypto.randomUUID();

    if (input.artifactId) {
      const accessLevel = await getArtifactAccessLevel({
        artifact: input.artifactId,
        currentUserId: ctx.session.userId,
      });

      if (accessLevel === ArtifactAccessLevel.noaccess) {
        throw new TRPCError({
          message: 'You do not have access to this artifact',
          code: 'FORBIDDEN',
        });
      }
    }

    const userCapabilities = await getCapabilitiesForUser(ctx.session.userId);
    let maxResolution = 1024;
    let quality = 65;
    if (userCapabilities.has(Capability.HighResImages)) {
      maxResolution = 2048;
      quality = 75;
    }
    if (userCapabilities.has(Capability.UltraHighResImages)) {
      maxResolution = 4096;
      quality = 80;
    }

    let fileBuffer: Buffer = Buffer.from(input.base64, 'base64');
    if (['image/png', 'image/jpeg'].includes(input.mimetype)) {
      fileBuffer = await sharp(fileBuffer)
        .rotate()
        .resize(maxResolution, maxResolution, {
          fit: 'contain',
          withoutEnlargement: true,
        })
        .jpeg({
          quality,
          mozjpeg: true,
        })
        .toBuffer();
    }

    const uploadResult = await uploadFileToS3(
      fileBuffer,
      input.mimetype,
      input.purpose,
    );

    const file = await prisma.file.create({
      data: {
        id,
        userId: ctx.session.userId,
        artifactId: input.artifactId,
        name: input.name,
        mimetype: input.mimetype,
        storageKey: uploadResult.key,
        purpose: input.purpose,
        metadata: {
          uploadResult, // We store this here in case we ever need fields from this in the future
        },
      },
      ...fileSummary,
    });

    return file;
  });
