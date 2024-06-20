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

export async function onStoreDocument(args: onStoreDocumentPayload) {
  const artifact = await prisma.artifact.findUnique({
    where: {
      id: args.documentName,
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
      id: args.documentName,
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
    artifactId: args.documentName,
    userId: args.context.userId,
    oldYBinB64: artifact.yBin.toString('base64'),
    newYBinB64: yBin.toString('base64'),
  });
}
