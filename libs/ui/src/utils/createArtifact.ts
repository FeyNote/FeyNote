import type { ArtifactTheme, ArtifactType } from '@prisma/client';
import { trpc } from './trpc';
import { addArtifactToArtifactTree } from './artifactTree/addArtifactToArtifactTree';
import { collaborationManager } from '../components/editor/collaborationManager';
import { appIdbStorageManager } from './AppIdbStorageManager';

export const createArtifact = async (args: {
  title: string;
  type?: ArtifactType;
  theme?: ArtifactTheme;
  yBin?: Uint8Array;
  tree?: {
    parentArtifactId: string;
    /** Lexographical sorting. Must be a fully uppercase string. It is recommended to add things around "X", or "Y". This is important! */
    order: string;
  };
}) => {
  // In preparation for local-first artifact creation
  const { id } = await trpc.artifact.getSafeArtifactId.query();

  const result = await trpc.artifact.createArtifact.mutate({
    id,
    title: args.title,
    type: args.type || 'tiptap',
    theme: args.theme || 'default',
    yBin: args.yBin,
  });

  if (args.tree) {
    const session = await appIdbStorageManager.getSession();
    if (!session) {
      throw new Error('createArtifact called with no session');
    }

    const connection = collaborationManager.get(
      `userTree:${session.userId}`,
      session,
    );
    await connection.syncedPromise;
    const treeYDoc = connection.yjsDoc;

    await addArtifactToArtifactTree({
      yDoc: treeYDoc,
      parentArtifactId: args.tree.parentArtifactId,
      order: args.tree.order,
      newItemId: id,
    });
  }

  return result;
};
