import { withCollaborationConnection } from '../../utils/collaboration/collaborationManager';
import {
  ARTIFACT_META_KEY,
  getArtifactAccessLevel,
} from '@feynote/shared-utils';
import type { TypedMap } from 'yjs-types';
import type { YArtifactMeta } from '@feynote/global-types';
import { useSessionContext } from '../../context/session/SessionContext';
import { trpc } from '../../utils/trpc';
import { ActionDialog } from '../sharedComponents/ActionDialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useArtifactDeleteOrRemoveSelfWithConfirmation() {
  const { t } = useTranslation();
  const [showConfirmationArtifactId, setShowConfirmationArtifactId] =
    useState<string>();
  const { deleteArtifactOrRemoveSelf } = useArtifactDeleteOrRemoveSelf();

  /**
   * You must render this out within your component so that it's part of the React tree!
   */
  const confirmationDialog = (
    <ActionDialog
      title={t('deleteArtifact.title')}
      description={t('deleteArtifact.subtitle')}
      open={!!showConfirmationArtifactId}
      actionButtons={[
        {
          title: t('generic.cancel'),
          props: {
            onClick: () => setShowConfirmationArtifactId(undefined),
          },
        },
        {
          title: t('generic.confirm'),
          props: {
            color: 'red',
            onClick: async () => {
              showConfirmationArtifactId &&
                deleteArtifactOrRemoveSelf(showConfirmationArtifactId);
              setShowConfirmationArtifactId(undefined);
            },
          },
        },
      ]}
    />
  );

  const deleteArtifactOrRemoveSelfWithConfirmation = (artifactId: string) => {
    setShowConfirmationArtifactId(artifactId);
  };

  return {
    deleteArtifactOrRemoveSelfWithConfirmation,
    confirmationDialog,
  };
}

export function useArtifactDeleteOrRemoveSelf() {
  const { session } = useSessionContext();

  /**
   * This method is a little strange! Since we really _want_ to handle everything locally,
   * this method attempts to be as local as possible. Unfortunately in the case of
   * collaborators, we need the server's help.
   * Because of this, we first attempt to delete the artifact locally. If we fail to do so due to permissions,
   * we call the server to remove ourselves as a collaborator.
   * This means that this function can throw a TRPCError.
   */
  const deleteArtifactOrRemoveSelf = async (
    artifactId: string,
  ): Promise<void> => {
    const accessLevel = await withCollaborationConnection(
      `artifact:${artifactId}`,
      async (connection) => {
        const accessLevel = getArtifactAccessLevel(
          connection.yjsDoc,
          session.userId,
        );

        if (accessLevel !== 'coowner') {
          return accessLevel;
        }

        const map = connection.yjsDoc.getMap(ARTIFACT_META_KEY) as TypedMap<
          Partial<YArtifactMeta>
        >;

        map.set('deletedAt', new Date().getTime());

        return accessLevel;
      },
    );

    if (accessLevel === 'readwrite' || accessLevel === 'readonly') {
      await trpc.artifact.removeSelfAsCollaborator.mutate({
        artifactId: artifactId,
      });
    }
  };

  return {
    deleteArtifactOrRemoveSelf,
  };
}
