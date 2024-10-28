import { useIonAlert } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';

export const useArtifactDelete = () => {
  const { t } = useTranslation();
  const [presentAlert] = useIonAlert();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const _deleteArtifact = (artifactId: string) => {
    return new Promise<void>((resolve, reject) => {
      trpc.artifact.deleteArtifact
        .mutate({
          id: artifactId,
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          handleTRPCErrors(error);

          reject();
        });
    });
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
              reject();
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
