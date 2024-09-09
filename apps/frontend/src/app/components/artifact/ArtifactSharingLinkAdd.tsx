import {
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';

interface Props {
  artifactId: string;
  onAdded: () => void;
}

export const ArtifactSharingLinkAdd: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const [accessLevel, setAccessLevel] = useState<'readwrite' | 'readonly'>(
    'readonly',
  );

  const onAddClick = () => {
    presentAlert({
      header: t('artifactSharing.links.allowAddToAccount.header'),
      message: t('artifactSharing.links.allowAddToAccount.message'),
      buttons: [
        {
          text: t('generic.cancel'),
        },
        {
          text: t('artifactSharing.links.allowAddToAccount.deny'),
          handler: () => {
            createShareToken(false);
          },
        },
        {
          text: t('artifactSharing.links.allowAddToAccount.allow'),
          handler: () => {
            createShareToken(true);
          },
        },
      ],
    });
  };

  const createShareToken = (allowAddToAccount: boolean) => {
    trpc.artifactShareToken.createArtifactShareToken
      .mutate({
        artifactId: props.artifactId,
        accessLevel,
        allowAddToAccount,
      })
      .then(() => {
        props.onAdded();
      })
      .catch((error) => {
        handleTRPCErrors(presentToast, error);
      });
  };

  return (
    <IonItem lines="none" button>
      <IonLabel>{t('artifactSharing.links.create')}</IonLabel>
      <IonSelect
        value={accessLevel}
        onIonDismiss={(event) => setAccessLevel(event.target.value)}
      >
        <IonSelectOption value="readwrite">
          {t('artifactSharing.readwrite')}
        </IonSelectOption>
        <IonSelectOption value="readonly">
          {t('artifactSharing.readonly')}
        </IonSelectOption>
      </IonSelect>
      <IonButton slot="end" fill="clear" onClick={onAddClick}>
        {t('artifactSharing.links.add')}
      </IonButton>
    </IonItem>
  );
};
