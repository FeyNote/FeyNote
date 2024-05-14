import { Fragment } from 'prosemirror-model';

export function getReferencesFromProsemirrorPasteFragment(fragment: Fragment) {
  const results: {
    artifactId: string,
    artifactBlockId?: string,
  }[] = [];

  fragment.forEach((node) => {
    if (node.attrs.artifactId) {
      results.push({
        artifactId: node.attrs.artifactId,
        artifactBlockId: node.attrs.artifactBlockId,
      });
    }

    if (node.content) {
      const childResults = getReferencesFromProsemirrorPasteFragment(node.content);
      results.push(...childResults);
    }
  });

  return results;
}
