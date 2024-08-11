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
            userId: args.context.userId, // TODO: Impl sharing permission check here
          },
          select: {
            yBin: true,
          },
        });

        if (!artifact) {
          throw new Error();
        }

        applyUpdate(args.document, artifact.yBin);

        return args.document;
      }
    }
  } catch (e) {
    console.error(e);

    throw e;
  }
}
