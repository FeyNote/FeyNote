import * as Y from 'yjs';
import { onStoreDocumentPayload } from '@hocuspocus/server';

import { prisma } from '@feynote/prisma/client';
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
      const { count } = await prisma.artifact.updateMany({
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

      if (count === 0) {
        await prisma.artifact.create({
          data: {
            id: identifier,
            userId: args.context.userId,
            yBin,
            syncVersion: 1,
          }
        });
      }
    }
  }
}
