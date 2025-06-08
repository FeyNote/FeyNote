import { onAuthenticatePayload } from '@hocuspocus/server';

import { isSessionExpired, logger } from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';
import { ArtifactAccessLevel } from '@prisma/client';

export async function onAuthenticate(args: onAuthenticatePayload) {
  try {
    const session = await prisma.session.findUnique({
      where: {
        token: args.token,
      },
    });
    if (!session) {
      logger.debug('Session not found');
      throw new Error();
    }

    if (isSessionExpired(session)) {
      logger.debug('Session is expired');
      throw new Error();
    }

    // This will be available in all future methods!
    const context = {
      userId: session.userId,
      isOwner: false,
    };

    const [type, identifier] = splitDocumentName(args.documentName);

    switch (type) {
      case SupportedDocumentType.Artifact: {
        const artifact = await prisma.artifact.findUnique({
          where: {
            id: identifier,
          },
          select: {
            userId: true,
            artifactShares: {
              select: {
                userId: true,
                accessLevel: true,
              },
            },
          },
        });

        if (!artifact) {
          logger.debug(
            'User attempted to authenticate to an artifact that does not exist',
          );
          throw new Error();
        }

        const artifactShare = artifact.artifactShares.find(
          (share) => share.userId === context.userId,
        );
        if (
          (artifact.userId !== context.userId && !artifactShare) ||
          artifactShare?.accessLevel === ArtifactAccessLevel.noaccess
        ) {
          logger.debug(
            'User attempted to connect to artifact that they do not have access to',
          );
          throw new Error();
        }

        if (
          artifact.userId !== context.userId &&
          artifactShare?.accessLevel === ArtifactAccessLevel.readonly
        ) {
          args.connection.readOnly = true;
        }

        if (artifact.userId === context.userId) {
          context.isOwner = true;
        }

        break;
      }
      case SupportedDocumentType.UserTree: {
        if (identifier !== context.userId) {
          logger.debug(
            'User attempted to connect to userTree that is not their own',
          );
          throw new Error();
        }

        context.isOwner = true;

        break;
      }
    }

    return context;
  } catch (e) {
    if (!(e instanceof Error) || e.message) {
      logger.error(e);
    }

    throw e;
  }
}
