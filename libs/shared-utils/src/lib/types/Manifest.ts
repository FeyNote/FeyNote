export interface Edge {
  id: string;
  artifactTitle: string;
  artifactId: string;
  artifactBlockId: string;
  artifactDeleted: boolean;
  targetArtifactId: string;
  targetArtifactBlockId: string | null;
  targetArtifactDate: string | null;
  targetArtifactTitle: string | null;
  targetArtifactDeleted: boolean;
  referenceText: string;
}

export interface Manifest {
  edges: Edge[];
  artifactVersions: Record<string, number>;
}
