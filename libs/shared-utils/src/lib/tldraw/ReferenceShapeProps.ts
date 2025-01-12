import { ReferenceShapeIconOptions } from './ReferenceShapeIconOptions';

export interface ReferenceShapeProps {
  targetArtifactId: string;
  targetArtifactBlockId: string | null;
  targetArtifactDate: string | null;
  referenceText: string;
  icon: ReferenceShapeIconOptions;
}
