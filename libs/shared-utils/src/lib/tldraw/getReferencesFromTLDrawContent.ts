import { Array as YArray } from 'yjs';
import type { TLRecord } from 'tldraw';
import { ReferenceShapeProps } from './ReferenceShapeProps';

export interface ReferencesFromTLDrawContentResult {
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId?: string;
  targetArtifactDate?: string;
  referenceText: string;
}

export const getReferencesFromTLDrawContent = (
  tldrawContent: YArray<{
    key: string;
    val: TLRecord;
  }>,
): ReferencesFromTLDrawContentResult[] => {
  const results: ReferencesFromTLDrawContentResult[] = [];

  for (let i = 0; tldrawContent.get(i); i++) {
    const entry = tldrawContent.get(i);
    const value = entry.val;
    if (value.typeName === 'shape' && value.type === 'reference') {
      const props = value.props as ReferenceShapeProps;
      results.push({
        artifactBlockId: value.id,
        targetArtifactId: props.targetArtifactId,
        targetArtifactBlockId: props.targetArtifactBlockId || undefined,
        targetArtifactDate: props.targetArtifactDate || undefined,
        referenceText: props.referenceText,
      });
    }
  }

  return results;
};
