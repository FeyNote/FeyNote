import { IonItem, IonSelect, IonSelectOption } from '@ionic/react';
import { ArtifactAccessLevel } from '@prisma/client';
import { useTranslation } from 'react-i18next';

interface Props {
  artifactAccessLevel: ArtifactAccessLevel;
  setArtifactAccessLevel: (accessLevel: ArtifactAccessLevel) => void;
}

export const ArtifactLinkAccessLevelSelect: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <IonItem lines="none">
      <IonSelect
        label={t('artifactSharing.link.accessLevel')}
        value={props.artifactAccessLevel}
        onIonDismiss={(event) =>
          props.setArtifactAccessLevel(event.target.value)
        }
      >
        <IonSelectOption value="readonly">
          {t('artifactSharing.readonly')}
        </IonSelectOption>
        <IonSelectOption value="noaccess">
          {t('artifactSharing.noaccess')}
        </IonSelectOption>
      </IonSelect>
    </IonItem>
  );
};
