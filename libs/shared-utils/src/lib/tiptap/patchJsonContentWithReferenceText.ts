import { JSONContent } from '@tiptap/core';
import { jsonContentForEach } from './jsonContentForEach';

/**
 * This method "patches" the provided jsonContent with the provided references
 * updating the reference text within the jsonContent with the provided referenceText.
 */
export function patchJsonContentWithReferenceText(
  root: JSONContent,
  references: {
    artifactBlockId: string;
    targetArtifactId: string;
    targetArtifactBlockId?: string;
    referenceText: string;
  }[],
) {
  const referenceByReferenceId = new Map<string, (typeof references)[0]>();

  for (const reference of references) {
    referenceByReferenceId.set(
      reference.targetArtifactId + reference.targetArtifactBlockId,
      reference,
    );
  }

  jsonContentForEach(root, (jsonContent) => {
    if (jsonContent.attrs && jsonContent.type === 'artifactReference') {
      const reference = referenceByReferenceId.get(
        jsonContent.attrs['artifactId'] + jsonContent.attrs['artifactBlockId'],
      );
      if (!reference) return;
      jsonContent.attrs['referenceText'] = reference.referenceText;
    }
  });
}
