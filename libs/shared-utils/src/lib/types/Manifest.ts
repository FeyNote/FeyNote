export interface Edge {
  id: string;
  artifactTitle: string;
  artifactId: string;
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId: string | null;
  targetArtifactDate: string | null;
  targetArtifactTitle: string | null;
  referenceText: string;
  isBroken: boolean;
}

export interface Manifest {
  edges: Edge[];
  artifactVersions: Record<string, number>;
}
