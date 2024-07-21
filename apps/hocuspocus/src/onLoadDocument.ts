import { onLoadDocumentPayload } from '@hocuspocus/server';
import * as Y from 'yjs';

import { prisma } from '@feynote/prisma/client';
import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';

export async function onLoadDocument(args: onLoadDocumentPayload) {
  const [type, identifier] = splitDocumentName(args.documentName);

  switch(type) {
    case SupportedDocumentType.Artifact: {
      let artifact = await prisma.artifact.findUnique({
        where: {
          id: identifier,
          userId: args.context.userId, // TODO: Impl sharing permission check here
        },
        select: {
          yBin: true,
        },
      });

      if (artifact) {
        Y.applyUpdate(args.document, artifact.yBin);
        return args.document;
      }

      console.log("Artifact not found");
      return new Y.Doc();

      // const newDoc = new Y.Doc();
      // await prisma.artifact.create({
      //   data: {
      //     id: identifier,
      //     userId: args.context.userId,
      //     yBin:
      //   }
      //
      // });
      //
      // return args.document;
    }

    case SupportedDocumentType.Manifest: {
      const user = await prisma.user.findUnique({
        where: {
          id: identifier
        },
        select: {
          yManifestBin: true,
        }
      });

      if (!user) {
        console.error("User not found");
        throw new Error();
      }

      Y.applyUpdate(args.document, user.yManifestBin);

      return args.document;
    }
  }
}
