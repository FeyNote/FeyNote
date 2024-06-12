import { JSONContent } from '@tiptap/core';
import { jsonContentForEach } from './jsonContentForEach';
import { getIdForJSONContent } from './getIdForJSONContent';

export interface ReferencesFromJSONContentResult {
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId?: string;
  referenceText: string;
}

export const getReferencesFromJSONContent = (
  jsonContent: JSONContent,
): ReferencesFromJSONContentResult[] => {
  const results: ReferencesFromJSONContentResult[] = [];

  jsonContentForEach(jsonContent, (element) => {
    if (element.type === 'artifactReference') {
      results.push({
        artifactBlockId: getIdForJSONContent(element),
        targetArtifactId: element.attrs?.['artifactId'],
        targetArtifactBlockId: element.attrs?.['artifactBlockId'],
        referenceText: element.attrs?.['referenceText'],
      });
    }
  });

  return results;
};
