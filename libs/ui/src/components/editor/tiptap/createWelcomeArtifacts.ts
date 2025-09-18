import { trpc } from '../../../utils/trpc';
import { buildWelcomeArtifact } from './templates/buildWelcomeArtifact';
import { buildIntroducingReferencesArtifact } from './templates/buildIntroducingReferencesArtifact';
import { withCollaborationConnection } from '../../../utils/collaboration/collaborationManager';
import { appIdbStorageManager } from '../../../utils/AppIdbStorageManager';
import { addArtifactToArtifactTree } from '../../../utils/artifactTree/addArtifactToArtifactTree';

export const createWelcomeArtifacts = async () => {
  const session = await appIdbStorageManager.getSession();
  if (!session)
    throw new Error(
      'createWelcomeArtifacts called before session was initialized',
    );

  const [{ id: welcomeId }, { id: introducingReferencesId }] =
    await Promise.all([
      trpc.artifact.getSafeArtifactId.query(),
      trpc.artifact.getSafeArtifactId.query(),
    ]);

  const introducingReferencesTemplate = buildIntroducingReferencesArtifact({
    id: introducingReferencesId,
    userId: session.userId,
  });
  const introducingReferences = await trpc.artifact.createArtifact.mutate({
    id: introducingReferencesTemplate.result.id,
    title: introducingReferencesTemplate.result.title,
    type: introducingReferencesTemplate.result.type,
    theme: introducingReferencesTemplate.result.theme,
    yBin: introducingReferencesTemplate.result.yBin,
  });

  const welcomeTemplate = buildWelcomeArtifact({
    id: welcomeId,
    userId: session.userId,
    relationArtifactId: introducingReferences.id,
    relationArtifactBlockId:
      introducingReferencesTemplate.meta.incomingReferenceBlockId,
  });

  const welcome = await trpc.artifact.createArtifact.mutate({
    id: welcomeTemplate.result.id,
    title: welcomeTemplate.result.title,
    type: welcomeTemplate.result.type,
    theme: welcomeTemplate.result.theme,
    yBin: welcomeTemplate.result.yBin,
  });

  await withCollaborationConnection(
    `userTree:${session.userId}`,
    async (connection) => {
      connection.yjsDoc.transact(() => {
        addArtifactToArtifactTree({
          yDoc: connection.yjsDoc,
          parentArtifactId: null,
          order: 'X',
          newItemId: welcome.id,
        });
        addArtifactToArtifactTree({
          yDoc: connection.yjsDoc,
          parentArtifactId: null,
          order: 'XX',
          newItemId: introducingReferences.id,
        });
      });
    },
    30000, // We're generous here, since creating welcome artifacts is usually the first thing that occurs when the user launches FeyNote for the first time and things can take time to setup
  );
};
