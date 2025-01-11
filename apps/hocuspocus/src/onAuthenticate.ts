import { onAuthenticatePayload } from '@hocuspocus/server';

import { isSessionExpired } from '@feynote/api-services';
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
      console.log('Session not found');
      throw new Error();
    }

    if (isSessionExpired(session)) {
      console.log('Session is expired');
      throw new Error();
    }

    // This will be available in all future methods!
    const context = {
      userId: session.userId,
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
          console.log(
            'User attempted to authenticate to an artifact that does not exist',
          );
          throw new Error();
        }

        const artifactShare = artifact.artifactShares.find(
          (share) => share.userId === context.userId,
        );
        if (artifact.userId !== context.userId && !artifactShare) {
          console.log(
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

        break;
      }
      case SupportedDocumentType.UserTree: {
        if (identifier !== context.userId) {
          console.log(
            'User attempted to connect to userTree that is not their own',
          );
          throw new Error();
        }

        break;
      }
      case SupportedDocumentType.ArtifactCollection: {
        const artifactCollection = await prisma.artifactCollection.findUnique({
          where: {
            id: identifier,
          },
          select: {
            artifactCollectionShares: {
              select: {
                userId: true,
                accessLevel: true,
              },
            },
          },
        });

        if (!artifactCollection) {
          console.log(
            'User attempted to authenticate to an artifactCollection that does not exist',
          );
          throw new Error();
        }

        const artifactShare = artifactCollection.artifactCollectionShares.find(
          (share) => share.userId === context.userId,
        );
        if (!artifactShare) {
          console.log(
            'User attempted to connect to artifactCollection that they do not have access to',
          );
          throw new Error();
        }

        if (artifactShare.accessLevel === ArtifactAccessLevel.readonly) {
          args.connection.readOnly = true;
        }

        break;
      }
    }

    return context;
  } catch (e) {
    console.error(e);

    throw e;
  }
}
