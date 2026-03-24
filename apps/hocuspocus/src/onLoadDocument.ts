import { onLoadDocumentPayload } from '@hocuspocus/server';
import { applyUpdate } from 'yjs';

import { prisma } from '@feynote/prisma/client';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import type { TypedMap } from 'yjs-types';
import type { YArtifactMeta } from '@feynote/global-types';
import {
  logger,
  metrics,
  splitDocumentName,
  SupportedDocumentType,
} from '@feynote/api-services';

export async function onLoadDocument(args: onLoadDocumentPayload) {
  try {
    const [type, identifier] = splitDocumentName(args.documentName);

    metrics.hocuspocusDocumentLoad.inc({
      document_type: type,
    });

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
          logger.debug('Attempted to load artifact that does not exist!');
          throw new Error();
        }

        applyUpdate(args.document, artifact.yBin);

        args.document.transact(() => {
          const artifactMetaMap = args.document.getMap(
            ARTIFACT_META_KEY,
          ) as TypedMap<Partial<YArtifactMeta>>;

          if (!artifactMetaMap.get('id'))
            artifactMetaMap.set('id', artifact.id);
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
          if (artifactMetaMap.get('deletedAt') === undefined)
            artifactMetaMap.set('deletedAt', null);
        });

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
          logger.debug('Attempted to load user tree that does not exist!');
          throw new Error();
        }

        if (user.treeYBin) {
          applyUpdate(args.document, user.treeYBin);
        }

        return;
      }
      case SupportedDocumentType.Workspace: {
        const workspace = await prisma.workspace.findUnique({
          where: {
            id: identifier,
          },
          select: {
            id: true,
            userId: true,
            name: true,
            linkAccessLevel: true,
            yBin: true,
          },
        });

        if (!workspace) {
          logger.debug('Attempted to load workspace that does not exist!');
          throw new Error();
        }

        applyUpdate(args.document, workspace.yBin);

        return;
      }
    }
  } catch (e) {
    if (!(e instanceof Error) || e.message) {
      logger.error(e);
    }

    throw e;
  }
}
