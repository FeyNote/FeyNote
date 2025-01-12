import { Doc as YDoc } from 'yjs';
import { getArtifactTreeFromYDoc } from './getArtifactTreeFromYDoc';

export const addArtifactToArtifactTree = async (args: {
  yDoc: YDoc;
  parentArtifactId: string | null;
  order: string; // Lexographical sorting. It is recommended to add things around "X", or "Y"
  newItemId: string;
}) => {
  const { yKeyValue } = getArtifactTreeFromYDoc(args.yDoc);

  yKeyValue.set(args.newItemId, {
    parentNodeId: args.parentArtifactId,
    order: args.order,
  });
};
