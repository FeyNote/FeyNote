import { Server } from '@hocuspocus/server';
import { Logger } from '@hocuspocus/extension-logger';
import { Throttle } from '@hocuspocus/extension-throttle';
import { Database } from '@hocuspocus/extension-database';
import { prisma } from '@feynote/prisma/client';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { isSessionExpired } from '@feynote/api-services';
import { ArtifactTheme } from '@prisma/client';
import { z } from 'zod';
import * as Y from 'yjs';
import { applyUpdate } from 'yjs';
import { encodeStateAsUpdate } from 'yjs';

const artifactMetaSchema = z.object({
  title: z.string(),
  theme: z.nativeEnum(ArtifactTheme),
  isPinned: z.boolean(),
  isTemplate: z.boolean(),
});

const server = Server.configure({
  async onAuthenticate({ token }) {
    const session = await prisma.session.findUnique({
      where: {
        token,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    if (!session) throw new Error('Session not found');

    if (isSessionExpired(session)) {
      throw new Error('Session is expired');
    }

    return {
      session,
    };
  },
  extensions: [
    new Throttle({
      throttle: 30, // Connections per minute
      banTime: 5, // Minutes
    }),
    new Logger(),
    new Database({
      fetch: async (asdf) => {
        const artifact = await prisma.artifact.findUnique({
          where: {
            id: asdf.documentName,
          },
          select: {
            title: true,
            theme: true,
            isPinned: true,
            isTemplate: true,
            json: true,
          },
        });

        if (!artifact) return null;

        const json = artifact.json as any;

        // Doc does not have any yJS content
        if (!json.yjsState) return null;

        const buff = Buffer.from(json.yjsState, 'base64');
        const document = new Y.Doc();
        applyUpdate(document, buff);

        const artifactMetaYMap = document.getMap('artifactMeta');

        if (!artifactMetaYMap.has('title')) {
          artifactMetaYMap.set('title', artifact.title);
        }
        if (!artifactMetaYMap.has('theme')) {
          artifactMetaYMap.set('theme', artifact.theme);
        }
        if (!artifactMetaYMap.has('isPinned')) {
          artifactMetaYMap.set('isPinned', artifact.isPinned);
        }
        if (!artifactMetaYMap.has('isTemplate')) {
          artifactMetaYMap.set('isTemplate', artifact.isTemplate);
        }

        return encodeStateAsUpdate(document);
      },
      store: async ({ documentName, state, document }) => {
        try {
          const artifact = await prisma.artifact.findUnique({
            where: {
              id: documentName,
            },
          });

          if (!artifact) throw new Error('Artifact does not exist');

          const tiptapDocument = TiptapTransformer.fromYdoc(
            document,
            'tiptapBody',
          );

          const artifactMetaYMap = document.getMap('artifactMeta');
          const artifactMeta = {
            title: artifactMetaYMap.get('title') as string,
            theme: artifactMetaYMap.get('theme') as ArtifactTheme,
            isPinned: artifactMetaYMap.get('isPinned') as boolean,
            isTemplate: artifactMetaYMap.get('isTemplate') as boolean,
          };

          artifactMetaSchema.parse(artifactMeta);

          await prisma.artifact.update({
            where: {
              id: documentName,
            },
            data: {
              ...artifactMeta,
              json: {
                ...(artifact.json as any),
                yjsState: state.toString('base64'),
                tiptapDocument,
              },
            },
          });
        } catch (e) {
          // Any error that is thrown in our handler must not be ejected to Hocuspocus, otherwise Hocuspocus will crash terminating all connections.
          //
          // TODO: Capture with cloud logger
        }
      },
    }),
  ],
});

server.listen();
