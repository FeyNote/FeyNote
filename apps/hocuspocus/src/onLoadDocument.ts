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
        },
        select: {
          userId: true,
          yBin: true,
        },
      });

      if (!artifact) {
        console.log(`Artifact not found: ${args.documentName}`);
        throw new Error(); // Important to throw an error without message, since that'll just unbind client from document
      }

      if (artifact.userId !== args.context.userId) {
        console.log(args.documentName, artifact.userId, args.context.userId);
        console.log(`No access to: ${args.documentName}`); // TODO: Impl sharing permission check here
        throw new Error(); // Important to throw an error without message, since that'll just unbind client from document
      }

      Y.applyUpdate(args.document, artifact.yBin);
      return args.document;

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

    // TODO: remove this since we don't want to do manifest using ydoc
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
