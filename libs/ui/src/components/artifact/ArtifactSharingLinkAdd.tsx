import {
  IonButton,
  IonItem,
  IonSelect,
  IonSelectOption,
  useIonAlert,
} from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';

interface Props {
  artifactId: string;
  onAdded: () => void;
}

export const ArtifactSharingLinkAdd: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentAlert] = useIonAlert();
  const [accessLevel, setAccessLevel] = useState<'readwrite' | 'readonly'>(
    'readonly',
  );
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const onAddClick = () => {
    if (accessLevel === 'readwrite') {
      // Read write tokens _must_ always allow adding to account,
      // since users can't edit within the link preview itself
      createShareToken(true);
      return;
    }

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
        handleTRPCErrors(error);
      });
  };

  return (
    <IonItem lines="none">
      <IonSelect
        label={t('artifactSharing.links.create')}
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
