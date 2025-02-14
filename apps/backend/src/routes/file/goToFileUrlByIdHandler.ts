import { z } from 'zod';

import {
  AuthenticationEnforcement,
  defineExpressHandler,
  ForbiddenExpressError,
  getArtifactAccessLevel,
  getSignedUrlForFilePurpose,
  NotFoundExpressError,
} from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import { ArtifactAccessLevel } from '@prisma/client';

const SIGNED_URL_EXPIRATION_SECONDS = 86400;

const schema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const goToFileUrlByIdHandler = defineExpressHandler(
  {
    schema,
    authentication: AuthenticationEnforcement.Optional,
  },
  async (req, res) => {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!file) {
      throw new NotFoundExpressError('File does not exist');
    }

    if (file.purpose === 'artifact') {
      if (!file.artifactId) {
        throw new Error('File with purpose artifact has no artifact id');
      }

      const accessLevel = await getArtifactAccessLevel({
        artifact: file.artifactId,
        currentUserId: res.locals.session?.userId,
      });

      if (accessLevel === ArtifactAccessLevel.noaccess) {
        throw new ForbiddenExpressError('You do not have access to this file');
      }
    }

    const url = await getSignedUrlForFilePurpose({
      key: file.storageKey,
      operation: 'getObject',
      purpose: file.purpose,
      expiresInSeconds: SIGNED_URL_EXPIRATION_SECONDS,
    });

    // We use 302 since signed URL are temporary
    res.redirect(302, url);
  },
);
