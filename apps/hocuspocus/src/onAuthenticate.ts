import { onAuthenticatePayload } from '@hocuspocus/server';

import { isSessionExpired, logger, metrics } from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';
import { ArtifactAccessLevel } from '@prisma/client';
import { getArtifactAccessLevel } from '@feynote/shared-utils';

export async function onAuthenticate(args: onAuthenticatePayload) {
  const [type, identifier] = splitDocumentName(args.documentName);

  try {
    metrics.hocuspocusAuthenticateAttempt.inc({
      document_type: type,
    });

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

    switch (type) {
      case SupportedDocumentType.Artifact: {
        let accessLevel: ArtifactAccessLevel = ArtifactAccessLevel.noaccess;

        const inMemoryDoc = args.instance.documents.get(args.documentName);
        if (inMemoryDoc) {
          accessLevel = getArtifactAccessLevel(inMemoryDoc, context.userId);
        } else {
          const artifact = await prisma.artifact.findUnique({
            where: {
              id: identifier,
            },
            select: {
              userId: true,
              linkAccessLevel: true,
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

          accessLevel = getArtifactAccessLevel(artifact, context.userId);
        }

        if (accessLevel === ArtifactAccessLevel.noaccess) {
          logger.debug(
            'User attempted to connect to artifact that they do not have access to',
          );
          throw new Error();
        }

        if (
          accessLevel !== ArtifactAccessLevel.readwrite &&
          accessLevel !== ArtifactAccessLevel.coowner
        ) {
          args.connectionConfig.readOnly = true;
        }

        if (accessLevel === ArtifactAccessLevel.coowner) {
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

    metrics.hocuspocusAuthenticate.inc({
      document_type: type,
    });

    return context;
  } catch (e) {
    if (!(e instanceof Error) || e.message) {
      logger.error(e);
    }

    metrics.hocuspocusAuthenticateFailed.inc({
      document_type: type,
    });

    throw e;
  }
}
