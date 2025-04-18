import type { JSONContent } from '@tiptap/core';
import { getEdgeStore } from '../../../../../utils/edgesReferences/edgeStore';

/**
 * Grabs the text from a JSONContent object and all of it's children.
 * NOTE: This is is a modified version of getTextForJSONContent that includes the text of the edges.
 */
export const getTextForJSONContentWithEdges = async (args: {
  root: JSONContent;
  artifactId: string;
}): Promise<string> => {
  const { root, artifactId } = args;

  if (root.type === 'text') {
    return root.text?.trim() || '';
  }
  if (root.type === 'artifactReference' && root.attrs) {
    const edgeParams = {
      artifactId: artifactId,
      artifactBlockId: root.attrs.id,
      targetArtifactId: root.attrs.artifactId,
      targetArtifactBlockId: root.attrs.artifactBlockId,
      targetArtifactDate: root.attrs.artifactDate,
    };

    const edge = await getEdgeStore().getEdge(edgeParams);

    if (!edge) return '@' + root.attrs.artifactId;

    return `@${edge.referenceText}`;
  }
  if (!root.content) return '';

  const childContent: string[] = [];
  for (const content of root.content) {
    childContent.push(
      await getTextForJSONContentWithEdges({
        ...args,
        root: content,
      }),
    );
  }
  return childContent.filter((el) => el).join(' ');
};
