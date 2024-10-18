import { ArtifactDTO } from '@feynote/global-types';

export interface ReferenceListItem {
  artifactId: string;
  artifactBlockId: string | undefined;
  referenceText: string;
  artifact: ArtifactDTO;
}
