import { trpc } from '../../../utils/trpc';
import { buildWelcomeArtifact } from './templates/buildWelcomeArtifact';
import { buildIntroducingReferencesArtifact } from './templates/buildIntroducingReferencesArtifact';
import { withCollaborationConnection } from '../../../utils/collaboration/collaborationManager';
import { appIdbStorageManager } from '../../../utils/localDb/AppIdbStorageManager';
import { addArtifactToArtifactTree } from '../../../utils/artifactTree/addArtifactToArtifactTree';
import { eventManager } from '../../../context/events/EventManager';
import { EventName } from '../../../context/events/EventName';

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
  await trpc.artifact.createArtifact.mutate({
    yBin: introducingReferencesTemplate.result.yBin,
  });

  const welcomeTemplate = buildWelcomeArtifact({
    id: welcomeId,
    userId: session.userId,
    relationArtifactId: introducingReferencesId,
    relationArtifactBlockId:
      introducingReferencesTemplate.meta.incomingReferenceBlockId,
  });
  await trpc.artifact.createArtifact.mutate({
    yBin: welcomeTemplate.result.yBin,
  });

  eventManager.broadcast(EventName.ArtifactWelcomeCreated, {
    welcomeId,
    introducingReferencesId,
  });

  await withCollaborationConnection(
    `userTree:${session.userId}`,
    async (connection) => {
      connection.yjsDoc.transact(() => {
        addArtifactToArtifactTree({
          ref: connection.yjsDoc,
          parentArtifactId: null,
          order: 'X',
          id: welcomeId,
        });
        addArtifactToArtifactTree({
          ref: connection.yjsDoc,
          parentArtifactId: welcomeId,
          order: 'X',
          id: introducingReferencesId,
        });
      });
    },
    30000, // We're generous here, since creating welcome artifacts is usually the first thing that occurs when the user launches FeyNote for the first time and things can take time to setup
  );
};
