import { Array as YArray } from 'yjs';

export interface ReferencesFromTLDrawContentResult {
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId?: string;
  targetArtifactDate?: string;
  referenceText: string;
}

export const getReferencesFromTLDrawContent = (
  tldrawContent: YArray<any>,
): ReferencesFromTLDrawContentResult[] => {
  const results: ReferencesFromTLDrawContentResult[] = [];

  for (let i = 0; tldrawContent.get(i); i++) {
    const entry = tldrawContent.get(i);
    const value = entry.val;
    if (value.type === 'reference') {
      results.push({
        artifactBlockId: value.id,
        targetArtifactId: value.props.targetArtifactId,
        targetArtifactBlockId: value.props.targetArtifactBlockId,
        targetArtifactDate: value.props.targetArtifactDate,
        referenceText: value.props.referenceText,
      });
    }
  }

  return results;
};
