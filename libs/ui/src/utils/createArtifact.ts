import type {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import { trpc } from './trpc';
import { addArtifactToArtifactTree } from './artifactTree/addArtifactToArtifactTree';
import { withCollaborationConnection } from '../components/editor/collaborationManager';
import { appIdbStorageManager } from './AppIdbStorageManager';
import type { YArtifactUserAccess } from '@feynote/global-types';

export const createArtifact = async (args: {
  title: string;
  type?: ArtifactType;
  theme?: ArtifactTheme;
  yBin?: Uint8Array;
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
  tree?: {
    parentArtifactId: string;
    /** Lexographical sorting. Must be a fully uppercase string. It is recommended to add things around "X", or "Y". This is important! */
    order: string;
  };
}) => {
  // In preparation for local-first artifact creation
  const { id } = await trpc.artifact.getSafeArtifactId.query();

  let userAccess: {
    key: string;
    val: YArtifactUserAccess;
  }[] = [];
  if (Array.isArray(args.userAccess)) {
    userAccess = args.userAccess;
  } else {
    for (const value of args.userAccess?.values() || []) {
      userAccess.push(value);
    }
  }

  const result = await trpc.artifact.createArtifact.mutate({
    id,
    title: args.title,
    type: args.type || 'tiptap',
    theme: args.theme || 'default',
    userAccess: userAccess.length ? userAccess : undefined,
    linkAccessLevel: args.linkAccessLevel,
    yBin: args.yBin,
  });

  if (args.tree) {
    const session = await appIdbStorageManager.getSession();
    if (!session) {
      throw new Error('createArtifact called with no session');
    }

    await withCollaborationConnection(
      `userTree:${session.userId}`,
      session,
      async (connection) => {
        // TS requires the additional check here
        if (args.tree) {
          await addArtifactToArtifactTree({
            yDoc: connection.yjsDoc,
            parentArtifactId: args.tree.parentArtifactId,
            order: args.tree.order,
            newItemId: id,
          });
        }
      },
    );
  }

  return result;
};
