export interface KnownArtifactReference {
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId?: string;
  referenceText: string;
  isBroken: boolean;
}
