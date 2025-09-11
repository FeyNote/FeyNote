import { Doc as YDoc } from 'yjs';
import { getArtifactTreeFromYDoc } from './getArtifactTreeFromYDoc';
import { YKeyValue } from 'y-utility/y-keyvalue';

interface Args {
  ref: YKeyValue<{
    parentNodeId: string | null;
    order: string;
  }> | YDoc,
  parentArtifactId: string | null;
  /** Lexographical sorting. It is recommended to add things around "X", or "Y". This is important! */
  order: string;
  id: string;
}

export const addArtifactToArtifactTree = (args: Args) => {
  const treeYKV = (() => {
    if (args.ref instanceof YKeyValue) {
      return args.ref;
    }

    return getArtifactTreeFromYDoc(args.ref).yKeyValue;
  })();

  treeYKV.set(args.id, {
    parentNodeId: args.parentArtifactId,
    order: args.order,
  });
};
