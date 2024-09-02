import { useIonAlert, useIonToast } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';

export const useArtifactDelete = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

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
          handleTRPCErrors(error, presentToast);

          reject();
        });
    });
  };

  const deleteArtifact = (artifactId: string) => {
    return new Promise<void>((resolve, reject) => {
      presentAlert({
        header: t('artifactDelete.header'),
        message: t('artifactDelete.message'),
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
