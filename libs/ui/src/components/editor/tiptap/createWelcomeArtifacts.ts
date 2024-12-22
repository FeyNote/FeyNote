import { trpc } from '../../../utils/trpc';
import { buildWelcomeArtifact } from './templates/buildWelcomeArtifact';
import { buildIntroducingReferencesArtifact } from './templates/buildIntroducingReferencesArtifact';
import { collaborationManager } from '../collaborationManager';
import { appIdbStorageManager } from '../../../utils/AppIdbStorageManager';
import { addArtifactToArtifactTree } from '../../../utils/artifactTree/addArtifactToArtifactTree';

export const createWelcomeArtifacts = async () => {
  const session = await appIdbStorageManager.getSession();
  if (!session)
    throw new Error(
      'createWelcomeArtifacts called before session was initialized',
    );

  const connection = collaborationManager.get(
    `userTree:${session.userId}`,
    session,
  );
  await connection.syncedPromise;
  const treeYDoc = connection.yjsDoc;

  const introducingReferencesTemplate = buildIntroducingReferencesArtifact();
  const introducingReferences = await trpc.artifact.createArtifact.mutate({
    title: introducingReferencesTemplate.result.title,
    type: introducingReferencesTemplate.result.type,
    theme: introducingReferencesTemplate.result.theme,
    titleBodyMerge: introducingReferencesTemplate.result.titleBodyMerge,
    yBin: introducingReferencesTemplate.result.yBin,
  });

  const welcomeTemplate = buildWelcomeArtifact({
    relationArtifactId: introducingReferences.id,
    relationArtifactBlockId:
      introducingReferencesTemplate.meta.incomingReferenceBlockId,
  });

  const welcome = await trpc.artifact.createArtifact.mutate({
    title: welcomeTemplate.result.title,
    type: welcomeTemplate.result.type,
    theme: welcomeTemplate.result.theme,
    titleBodyMerge: welcomeTemplate.result.titleBodyMerge,
    yBin: welcomeTemplate.result.yBin,
  });

  treeYDoc.transact(() => {
    addArtifactToArtifactTree({
      yDoc: treeYDoc,
      parentArtifactId: null,
      order: 'X',
      newItemId: welcome.id,
    });
    addArtifactToArtifactTree({
      yDoc: treeYDoc,
      parentArtifactId: null,
      order: 'XX',
      newItemId: introducingReferences.id,
    });
  });
};
