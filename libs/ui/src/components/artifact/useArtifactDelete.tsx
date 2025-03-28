import { useIonAlert } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { collaborationManager } from '../editor/collaborationManager';
import { useContext } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';

export class ArtifactDeleteDeclinedError extends Error {
  constructor() {
    super('Artifact delete declined');
  }
}

export const useArtifactDelete = () => {
  const { t } = useTranslation();
  const [presentAlert] = useIonAlert();
  const { session } = useContext(SessionContext);

  const _deleteArtifact = async (artifactId: string): Promise<void> => {
    const connection = collaborationManager.get(
      `artifact:${artifactId}`,
      session,
    );
    await connection.syncedPromise;

    connection.yjsDoc
      .getMap(ARTIFACT_META_KEY)
      .set('deletedAt', new Date().toISOString());
  };

  const deleteArtifact = (artifactId: string) => {
    return new Promise<void>((resolve, reject) => {
      presentAlert({
        header: t('artifact.delete.header'),
        message: t('artifact.delete.message'),
        buttons: [
          {
            text: t('generic.cancel'),
            role: 'cancel',
            handler: () => {
              reject(new ArtifactDeleteDeclinedError());
            },
          },
          {
            text: t('generic.delete'),
            role: 'confirm',
            handler: () => {
              resolve(_deleteArtifact(artifactId));
            },
          },
        ],
      });
    });
  };

  return {
    deleteArtifact,
  };
};
