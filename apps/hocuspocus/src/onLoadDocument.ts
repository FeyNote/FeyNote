import { onLoadDocumentPayload } from '@hocuspocus/server';
import { applyUpdate } from 'yjs';

import { prisma } from '@feynote/prisma/client';
import {
  ARTIFACT_META_KEY,
  getWorkspaceMetaYKVFromYDoc,
} from '@feynote/shared-utils';
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
            createdAt: true,
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

          if (!artifactMetaMap.has('id'))
            artifactMetaMap.set('id', artifact.id);
          if (!artifactMetaMap.has('userId'))
            artifactMetaMap.set('userId', artifact.userId);
          if (!artifactMetaMap.has('title'))
            artifactMetaMap.set('title', artifact.title);
          if (!artifactMetaMap.has('theme'))
            artifactMetaMap.set('theme', artifact.theme);
          if (!artifactMetaMap.has('type'))
            artifactMetaMap.set('type', artifact.type);
          if (!artifactMetaMap.has('linkAccessLevel'))
            artifactMetaMap.set('linkAccessLevel', 'noaccess');
          if (!artifactMetaMap.has('deletedAt'))
            artifactMetaMap.set('deletedAt', null);
          if (!artifactMetaMap.has('createdAt'))
            artifactMetaMap.set('createdAt', artifact.createdAt.getTime());
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
            icon: true,
            color: true,
            linkAccessLevel: true,
            deletedAt: true,
            createdAt: true,
            yBin: true,
          },
        });

        if (!workspace) {
          logger.debug('Attempted to load workspace that does not exist!');
          throw new Error();
        }

        applyUpdate(args.document, workspace.yBin);

        args.document.transact(() => {
          const metaKV = getWorkspaceMetaYKVFromYDoc(args.document);

          if (!metaKV.has('id')) metaKV.set('id', workspace.id);
          if (!metaKV.has('userId')) metaKV.set('userId', workspace.userId);
          if (!metaKV.has('name')) metaKV.set('name', workspace.name);
          if (!metaKV.has('icon')) metaKV.set('icon', workspace.icon);
          if (!metaKV.has('color')) metaKV.set('color', workspace.color);
          if (!metaKV.has('linkAccessLevel'))
            metaKV.set('linkAccessLevel', workspace.linkAccessLevel);
          if (!metaKV.has('deletedAt'))
            metaKV.set('deletedAt', workspace.deletedAt?.getTime() ?? null);
          if (!metaKV.has('createdAt'))
            metaKV.set('createdAt', workspace.createdAt.getTime());
        });

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
