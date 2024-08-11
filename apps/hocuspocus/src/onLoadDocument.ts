import { onLoadDocumentPayload } from '@hocuspocus/server';
import { applyUpdate } from 'yjs';
import type { TypedMap } from 'yjs-types';

import { prisma } from '@feynote/prisma/client';
import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';
import {
  ARTIFACT_META_KEY,
  type YArtifactMetaSchema,
} from '@feynote/shared-utils';

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
            title: true,
            theme: true,
            type: true,
            yBin: true,
          },
        });

        if (!artifact) {
          throw new Error();
        }

        applyUpdate(args.document, artifact.yBin);

        const artifactMetaMap = args.document.getMap(
          ARTIFACT_META_KEY,
        ) as TypedMap<Partial<YArtifactMetaSchema>>;
        if (!artifactMetaMap.get('title'))
          artifactMetaMap.set('title', artifact.title);
        if (!artifactMetaMap.get('theme'))
          artifactMetaMap.set('theme', artifact.theme);
        if (!artifactMetaMap.get('type'))
          artifactMetaMap.set('type', artifact.type);

        return args.document;
      }
    }
  } catch (e) {
    console.error(e);

    throw e;
  }
}
