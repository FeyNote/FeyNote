import * as Y from 'yjs';
import { onStoreDocumentPayload } from '@hocuspocus/server';

import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';
import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';

export async function onStoreDocument(args: onStoreDocumentPayload) {
  const [type, identifier] = splitDocumentName(args.documentName);

  const yBin = Buffer.from(Y.encodeStateAsUpdate(args.document));

  switch (type) {
    case SupportedDocumentType.Manifest: {
      await prisma.user.update({
        where: {
          id: identifier,
        },
        data: {
          yManifestBin: yBin,
        }
      });
    }

    case SupportedDocumentType.Artifact: {
      const artifact = await prisma.artifact.findUnique({
        where: {
          id: identifier,
        },
      });

      if (!artifact) throw new Error();

      await prisma.artifact.update({
        where: {
          id: identifier,
        },
        data: {
          yBin,
          syncVersion: {
            increment: 1,
          },
        },
      });

      await enqueueArtifactUpdate({
        artifactId: identifier,
        userId: args.context.userId,
        oldYBinB64: artifact.yBin.toString('base64'),
        newYBinB64: yBin.toString('base64'),
      });
    }
  }
}
