import { z } from 'zod';

import {
  AuthenticationEnforcement,
  defineExpressHandler,
  ForbiddenExpressError,
  getSignedUrlForFilePurpose,
  hasArtifactAccess,
  NotFoundExpressError,
} from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { hmacSha256Hex } from '@feynote/shared-utils';

const SIGNED_URL_EXPIRATION_SECONDS = 86400;

const schema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.union([
    z.object({
      signature: z.undefined().optional(),
      timestamp: z.undefined().optional(),
      sessionId: z.undefined().optional(),
    }),
    z.object({
      signature: z.string(),
      timestamp: z.string(),
      sessionId: z.string().uuid(),
    }),
  ]),
};

export const goToFileUrlByIdHandler = defineExpressHandler(
  {
    schema,
    authentication: AuthenticationEnforcement.Optional,
  },
  async function _goToFileUrlByIdHandler(req, res) {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!file) {
      throw new NotFoundExpressError('File does not exist');
    }

    let session = res.locals.session;
    if (req.query.sessionId && req.query.signature && req.query.timestamp) {
      const timestampMs = parseInt(req.query.timestamp ?? '', 10);
      if (
        isNaN(timestampMs) ||
        Math.abs(Date.now() - timestampMs) >
          SIGNED_URL_EXPIRATION_SECONDS * 1000
      ) {
        throw new ForbiddenExpressError('Signed URL has expired');
      }

      const sessionFromSig = await prisma.session.findUnique({
        where: {
          id: req.query.sessionId,
        },
      });

      if (sessionFromSig) {
        const signature = await hmacSha256Hex(
          sessionFromSig.token,
          `${req.params.id}-${req.query.timestamp}`,
        );

        if (signature === req.query.signature) {
          session = sessionFromSig;
        }
      }
    }

    if (file.purpose === 'artifact') {
      if (!file.artifactId) {
        throw new Error('File with purpose artifact has no artifact id');
      }

      const artifact = await prisma.artifact.findUnique({
        where: {
          id: file.artifactId,
        },
        ...artifactDetail,
      });

      if (!artifact || !hasArtifactAccess(artifact, session?.userId)) {
        throw new ForbiddenExpressError('You do not have access to this file');
      }
    } else {
      // Safety guard for any new file purposes (we don't want to accidentally no-perm files
      throw new ForbiddenExpressError('You do not have access to this file');
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
