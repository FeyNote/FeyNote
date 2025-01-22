import { onLoadDocumentPayload } from '@hocuspocus/server';
import { applyUpdate } from 'yjs';

import { prisma } from '@feynote/prisma/client';
import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';

export async function onLoadDocument(args: onLoadDocumentPayload) {
  try {
    const [type, identifier] = splitDocumentName(args.documentName);

    switch (type) {
      case SupportedDocumentType.Artifact: {
        const artifact = await prisma.artifact.findUnique({
          where: {
            id: identifier,
          },
          select: {
            title: true,
            theme: true,
            type: true,
            yBin: true,
          },
        });

        if (!artifact) {
          console.error('Attempted to load artifact that does not exist!');
          throw new Error();
        }

        applyUpdate(args.document, artifact.yBin);

        return args.document;
      }
      case SupportedDocumentType.UserTree: {
        const user = await prisma.user.findUnique({
          where: {
            id: identifier,
          },
          select: {
            treeYBin: true,
          },
        });

        if (!user) {
          console.error('Attempted to load user tree that does not exist!');
          throw new Error();
        }

        // If the user does not have a tree, the default ydoc created by hocuspocus will be used
        if (user.treeYBin) {
          applyUpdate(args.document, user.treeYBin);
        }

        return args.document;
      }
    }
  } catch (e) {
    console.error(e);

    throw e;
  }
}
