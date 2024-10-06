import { trpc } from '../../../utils/trpc';
import { buildWelcomeArtifact } from './templates/buildWelcomeArtifact';
import { buildWelcomeRelationArtifact } from './templates/buildWelcomeRelationArtifact';

export const createWelcomeArtifacts = async () => {
  const welcomeArtifacts = [
    buildWelcomeArtifact(),
    buildWelcomeRelationArtifact(),
  ];

  for (const artifact of welcomeArtifacts) {
    await trpc.artifact.createArtifact.mutate({
      title: artifact.title,
      type: artifact.type,
      theme: artifact.theme,
      titleBodyMerge: artifact.titleBodyMerge,
      yBin: artifact.yBin,
    });
  }
};
