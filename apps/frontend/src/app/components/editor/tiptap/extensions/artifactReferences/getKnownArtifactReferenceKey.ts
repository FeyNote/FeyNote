export const getKnownArtifactReferenceKey = (
  targetArtifactId: string,
  targetArtifactBlockId?: string,
) => {
  const key = targetArtifactBlockId
    ? `${targetArtifactId}.${targetArtifactBlockId}`
    : targetArtifactId;

  return key;
};
