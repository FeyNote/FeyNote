import { ArtifactDetail } from '@feynote/prisma/types';

export interface ReferenceListItem {
  artifactId: string;
  artifactBlockId: string | undefined;
  referenceText: string;
  artifact: ArtifactDetail;
}
