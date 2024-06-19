import { EditArtifactDetail } from './ArtifactRenderer';

type ArtifactModifedDiff = Omit<
  EditArtifactDetail,
  'templatedArtifacts' | 'artifactReferences' | 'incomingArtifactReferences'
>;

export const isArtifactModified = (
  oldArtifact: ArtifactModifedDiff,
  newArtifact: ArtifactModifedDiff,
) => {
  return (
    oldArtifact.title !== newArtifact.title ||
    oldArtifact.theme !== newArtifact.theme ||
    oldArtifact.isPinned !== newArtifact.isPinned ||
    oldArtifact.isTemplate !== newArtifact.isTemplate ||
    oldArtifact.text !== newArtifact.text ||
    oldArtifact.rootTemplateId !== newArtifact.rootTemplateId ||
    oldArtifact.artifactTemplate?.id !== newArtifact.artifactTemplate?.id
  );
};
