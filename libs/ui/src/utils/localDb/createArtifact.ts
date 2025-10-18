import type {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import { trpc } from '../trpc';
import { addArtifactToArtifactTree } from '../artifactTree/addArtifactToArtifactTree';
import { withCollaborationConnection } from '../collaboration/collaborationManager';
import { appIdbStorageManager } from './AppIdbStorageManager';
import type { YArtifactUserAccess } from '@feynote/global-types';
import { encodeStateAsUpdate, Doc as YDoc } from 'yjs';

export const createArtifact = async (args: {
  artifact:
    | {
        title: string;
        type?: ArtifactType;
        theme?: ArtifactTheme;
        userAccess?:
          | Map<
              string,
              {
                key: string;
                val: YArtifactUserAccess;
              }
            >
          | {
              key: string;
              val: YArtifactUserAccess;
            }[];
        linkAccessLevel?: ArtifactAccessLevel;
      }
    | {
        id: string; // This must match the id in the ydoc!
        y: YDoc | Uint8Array;
      };
  tree?: {
    parentArtifactId: string;
    /** Lexographical sorting. Must be a fully uppercase string. It is recommended to add things around "X", or "Y". This is important! */
    order: string;
  };
}) => {
  let id: string | undefined;

  if ('y' in args.artifact) {
    id = args.artifact.id;
    const yBin =
      args.artifact.y instanceof YDoc
        ? encodeStateAsUpdate(args.artifact.y)
        : args.artifact.y;
    await trpc.artifact.createArtifact.mutate({
      yBin,
    });
  } else {
    // In preparation for local-first artifact creation
    id = (await trpc.artifact.getSafeArtifactId.query()).id;

    let userAccess: {
      key: string;
      val: YArtifactUserAccess;
    }[] = [];
    if (Array.isArray(args.artifact.userAccess)) {
      userAccess = args.artifact.userAccess;
    } else {
      for (const value of args.artifact.userAccess?.values() || []) {
        userAccess.push(value);
      }
    }

    await trpc.artifact.createArtifact.mutate({
      id,
      title: args.artifact.title,
      type: args.artifact.type || 'tiptap',
      theme: args.artifact.theme || 'default',
      userAccess: userAccess.length ? userAccess : undefined,
      linkAccessLevel: args.artifact.linkAccessLevel,
    });
  }

  if (args.tree) {
    const session = await appIdbStorageManager.getSession();
    if (!session) {
      throw new Error('createArtifact called with no session');
    }

    await withCollaborationConnection(
      `userTree:${session.userId}`,
      async (connection) => {
        // TS requires the additional check here
        if (args.tree) {
          addArtifactToArtifactTree({
            ref: connection.yjsDoc,
            parentArtifactId: args.tree.parentArtifactId,
            order: args.tree.order,
            id,
          });
        }
      },
    );
  }

  return {
    id,
  };
};
