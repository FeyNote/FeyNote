export const getKnownArtifactReferenceKey = (
  targetArtifactId: string,
  targetArtifactBlockId?: string,
  targetArtifactDate?: string,
) => {
  return `${targetArtifactId}.${targetArtifactBlockId}.${targetArtifactDate}`;
};
