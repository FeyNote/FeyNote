import {
  IonButton,
  IonIcon,
  useIonAlert,
  useIonRouter,
  useIonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { trash } from 'ionicons/icons';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { routes } from '../../routes';

interface Props {
  artifactId: string;
}

export const ArtifactDeleteButton: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const router = useIonRouter();

  const _deleteArtifact = () => {
    trpc.artifact.deleteArtifact
      .mutate({
        id: props.artifactId,
      })
      .then(() => {
        router.push(routes.dashboard.build(), 'forward', 'replace');
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast, {
          404: () => {
            // Looks like artifact is already deleted
            router.push(routes.dashboard.build(), 'forward', 'replace');
          },
        });
      });
  };

  const deleteArtifact = () => {
    presentAlert({
      header: t('artifactDelete.header'),
      message: t('artifactDelete.message'),
      buttons: [
        {
          text: t('generic.cancel'),
          role: 'cancel',
        },
        {
          text: t('generic.delete'),
          role: 'confirm',
          handler: () => {
            _deleteArtifact();
          },
        },
      ],
    });
  };

  return (
    <IonButton onClick={deleteArtifact} expand="block" color="danger">
      <IonIcon size="small" slot="start" icon={trash} />
      {t('generic.delete')}
    </IonButton>
  );
};
