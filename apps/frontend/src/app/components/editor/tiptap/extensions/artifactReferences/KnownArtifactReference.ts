export interface KnownArtifactReference {
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId?: string;
  targetArtifactDate?: string;
  referenceText: string;
  isBroken: boolean;
}
