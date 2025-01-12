export interface GetEdgeIdArgs {
  artifactId: string;
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId: string | null | undefined;
  targetArtifactDate: string | null | undefined;
}

export const getEdgeId = (args: GetEdgeIdArgs) => {
  return `${args.artifactId}:${args.artifactBlockId}:${args.targetArtifactId}:${args.targetArtifactBlockId || undefined}:${args.targetArtifactDate || undefined}`;
};
