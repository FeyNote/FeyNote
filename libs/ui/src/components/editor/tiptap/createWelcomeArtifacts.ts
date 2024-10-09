import { trpc } from '../../../utils/trpc';
import { buildWelcomeArtifact } from './templates/buildWelcomeArtifact';
import { buildIntroducingReferencesArtifact } from './templates/buildIntroducingReferencesArtifact';

export const createWelcomeArtifacts = async () => {
  const introducingReferencesTemplate = buildIntroducingReferencesArtifact();
  const introducingReferences = await trpc.artifact.createArtifact.mutate({
    title: introducingReferencesTemplate.result.title,
    type: introducingReferencesTemplate.result.type,
    theme: introducingReferencesTemplate.result.theme,
    titleBodyMerge: introducingReferencesTemplate.result.titleBodyMerge,
    yBin: introducingReferencesTemplate.result.yBin,
  });

  const welcomeArtifact = buildWelcomeArtifact({
    relationArtifactId: introducingReferences.id,
    relationArtifactBlockId:
      introducingReferencesTemplate.meta.incomingReferenceBlockId,
  });

  await trpc.artifact.createArtifact.mutate({
    title: welcomeArtifact.result.title,
    type: welcomeArtifact.result.type,
    theme: welcomeArtifact.result.theme,
    titleBodyMerge: welcomeArtifact.result.titleBodyMerge,
    yBin: welcomeArtifact.result.yBin,
  });
};
