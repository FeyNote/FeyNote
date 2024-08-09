import * as Y from 'yjs';
import { onStoreDocumentPayload } from '@hocuspocus/server';

import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getMetaFromYArtifact,
  getTextForJSONContent,
  getTiptapContentFromYjsDoc,
} from '@feynote/shared-utils';
import { SupportedDocumentType } from './SupportedDocumentType';
import { splitDocumentName } from './splitDocumentName';

export async function onStoreDocument(args: onStoreDocumentPayload) {
  try {
    const [type, identifier] = splitDocumentName(args.documentName);

    switch (type) {
      case SupportedDocumentType.Artifact: {
        const artifact = await prisma.artifact.findUnique({
          where: {
            id: identifier,
          },
          select: {
            yBin: true,
            json: true,
          },
        });

        if (!artifact) throw new Error();

        const yBin = Buffer.from(Y.encodeStateAsUpdate(args.document));

        const tiptapBody = getTiptapContentFromYjsDoc(
          args.document,
          ARTIFACT_TIPTAP_BODY_KEY,
        );
        const text = getTextForJSONContent(tiptapBody);
        const artifactMeta = getMetaFromYArtifact(args.document);

        await prisma.artifact.update({
          where: {
            id: identifier,
          },
          data: {
            ...artifactMeta,
            text,
            yBin,
            json: {
              ...(artifact.json as any),
              tiptapBody,
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
  } catch (e) {
    console.error(e);

    throw e;
  }
}
