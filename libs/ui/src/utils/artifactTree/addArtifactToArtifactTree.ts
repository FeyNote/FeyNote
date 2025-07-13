import { Doc as YDoc } from 'yjs';
import { getArtifactTreeFromYDoc } from './getArtifactTreeFromYDoc';

interface Args {
  yDoc: YDoc;
  parentArtifactId: string | null;
  /** Lexographical sorting. It is recommended to add things around "X", or "Y". This is important! */
  order: string;
  newItemId: string;
}

export const addArtifactToArtifactTree = async (args: Args) => {
  const { yKeyValue } = getArtifactTreeFromYDoc(args.yDoc);

  yKeyValue.set(args.newItemId, {
    parentNodeId: args.parentArtifactId,
    order: args.order,
  });
};
