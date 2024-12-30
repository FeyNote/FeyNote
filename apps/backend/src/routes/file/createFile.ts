import { z } from 'zod';
import multer from 'multer';
import sharp from 'sharp';

import {
  AuthenticationEnforcement,
  defineExpressHandler,
  hasArtifactAccess,
  uploadFileToS3,
  BadRequestExpressError,
  NotFoundExpressError,
  getCapabilitiesForUser,
} from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail, fileSummary } from '@feynote/prisma/types';
import { FilePurpose } from '@prisma/client';
import { Capability } from '@feynote/shared-utils';

const MAX_FILE_SIZE_MB = 25;

const schema = {
  query: z.object({
    id: z.string().uuid().optional(),
    artifactId: z.string().uuid().optional(),
    name: z.string(),
    mimetype: z.string(),
    purpose: z.nativeEnum(FilePurpose),
  }),
};

export const createFileHandler = defineExpressHandler(
  {
    schema,
    authentication: AuthenticationEnforcement.Required,
    beforeHandlers: [
      multer({
        storage: multer.memoryStorage(),
        limits: {
          fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
        },
      }).single('file'),
    ],
  },
  async (req, res) => {
    if (!req.file) {
      throw new BadRequestExpressError('No file provided');
    }

    if (req.query.artifactId) {
      const artifact = await prisma.artifact.findUnique({
        where: {
          id: req.query.artifactId,
        },
        ...artifactDetail,
      });

      if (
        !artifact ||
        !hasArtifactAccess(artifact, res.locals.session.userId)
      ) {
        throw new NotFoundExpressError(
          'Artifact does not exist or is not visible to the current user',
        );
      }
    }

    const userCapabilities = await getCapabilitiesForUser(
      res.locals.session.userId,
    );
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

    let fileBuffer: Buffer = req.file.buffer;
    if (['image/png', 'image/jpeg'].includes(req.query.mimetype)) {
      fileBuffer = await sharp(req.file.buffer)
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
      req.query.mimetype,
      req.query.purpose,
    );

    const file = await prisma.file.create({
      data: {
        id: req.query.id,
        userId: res.locals.session.userId,
        artifactId: req.query.artifactId,
        name: req.query.name,
        mimetype: req.query.mimetype,
        storageKey: uploadResult.key,
        purpose: req.query.purpose,
        metadata: {
          uploadResult, // We store this here in case we ever need fields from this in the future
        },
      },
      ...fileSummary,
    });

    return {
      data: file,
      statusCode: 201,
    };
  },
);
