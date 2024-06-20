import { onLoadDocumentPayload } from '@hocuspocus/server';
import * as Y from 'yjs';

import { prisma } from '@feynote/prisma/client';

export async function onLoadDocument(args: onLoadDocumentPayload) {
  const artifact = await prisma.artifact.findUnique({
    where: {
      id: args.documentName,
      userId: args.context.userId, // TODO: Impl sharing permission check here
    },
    select: {
      yBin: true,
    },
  });

  if (!artifact) {
    throw new Error();
  }

  Y.applyUpdate(args.document, artifact.yBin);

  return args.document;
}
