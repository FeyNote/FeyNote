import { onLoadDocumentPayload } from '@hocuspocus/server';
import { applyUpdate } from 'yjs';
import type { TypedMap } from 'yjs-types';

import { prisma } from '@feynote/prisma/client';
import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import type { YArtifactMeta } from '@feynote/global-types';

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
            id: true,
            userId: true,
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

        const artifactMetaMap = args.document.getMap(
          ARTIFACT_META_KEY,
        ) as TypedMap<Partial<YArtifactMeta>>;
        if (!artifactMetaMap.get('id')) artifactMetaMap.set('id', artifact.id);
        if (!artifactMetaMap.get('userId'))
          artifactMetaMap.set('userId', artifact.userId);
        if (!artifactMetaMap.get('title'))
          artifactMetaMap.set('title', artifact.title);
        if (!artifactMetaMap.get('theme'))
          artifactMetaMap.set('theme', artifact.theme);
        if (!artifactMetaMap.get('type'))
          artifactMetaMap.set('type', artifact.type);
        if (!artifactMetaMap.get('linkAccessLevel'))
          artifactMetaMap.set('linkAccessLevel', 'noaccess');
        if (!artifactMetaMap.get('deletedAt'))
          artifactMetaMap.set('deletedAt', null);

        return;
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

        return;
      }
    }
  } catch (e) {
    console.error(e);

    throw e;
  }
}
