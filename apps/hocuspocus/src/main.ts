import { Server } from '@hocuspocus/server';
import { Logger } from '@hocuspocus/extension-logger';
import { Throttle } from '@hocuspocus/extension-throttle';
import { Database } from '@hocuspocus/extension-database';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';
import { isSessionExpired, yArtifactMetaSchema } from '@feynote/api-services';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getMetaFromYArtifact,
  getTiptapContentFromYjsDoc,
} from '@feynote/shared-utils';

const server = Server.configure({
  stopOnSignals: true, // Listen to SIGINT, SIGTERM
  async onAuthenticate({ token }) {
    const session = await prisma.session.findUnique({
      where: {
        token,
      },
    });
    if (!session) throw new Error('Session not found');

    if (isSessionExpired(session)) {
      throw new Error('Session is expired');
    }

    return {
      userId: session.userId,
    };
  },
  extensions: [
    new Throttle({
      throttle: 30, // Connections per minute
      banTime: 5, // Minutes
    }),
    new Logger(),
    new Database({
      fetch: async (args) => {
        const artifact = await prisma.artifact.findUnique({
          where: {
            id: args.documentName,
            userId: args.context.userId, // TODO: Impl sharing permission check here
          },
          select: {
            yBin: true,
          },
        });

        if (!artifact) return null;

        return artifact.yBin;
      },
      store: async (args) => {
        try {
          const artifact = await prisma.artifact.findUnique({
            where: {
              id: args.documentName,
              userId: args.context.userId, // TODO: Impl sharing permission check here
            },
            select: {
              yBin: true,
              json: true,
            },
          });

          if (!artifact) throw new Error('Artifact does not exist');

          const tiptapBody = getTiptapContentFromYjsDoc(
            args.document,
            ARTIFACT_TIPTAP_BODY_KEY,
          );
          const artifactMeta = getMetaFromYArtifact(args.document);

          yArtifactMetaSchema.parse(artifactMeta);

          await prisma.artifact.update({
            where: {
              id: args.documentName,
            },
            data: {
              ...artifactMeta,
              yBin: args.state,
              json: {
                ...(artifact.json as any),
                tiptapBody,
              },
            },
          });

          await enqueueArtifactUpdate({
            artifactId: args.documentName,
            userId: args.context.userId,
            oldYBin: artifact.yBin,
            newYBin: args.state,
          });
        } catch (e) {
          console.error(e);
          // Any error that is thrown in our handler must not be ejected to Hocuspocus, otherwise Hocuspocus will crash terminating all connections.
          //
          // TODO: Capture with cloud logger
        }
      },
    }),
  ],
});

server.listen();
