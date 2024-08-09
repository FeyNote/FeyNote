export interface Edge {
  artifactId: string;
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId: string | null;
  referenceText: string;
}

export interface Manifest {
  edges: Edge[];
  artifactVersions: Record<string, number>;
}
