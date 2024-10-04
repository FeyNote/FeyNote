import { IonSelect, IonSelectOption } from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface Props {
  label?: string;
  accessLevel: 'noaccess' | 'readwrite' | 'readonly' | 'coowner';
  onChange: (level: 'noaccess' | 'readwrite' | 'readonly' | 'coowner') => void;
}

export const ArtifactSharingAccessLevel: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <IonSelect
      label={props.label}
      value={props.accessLevel}
      onIonDismiss={(event) => props.onChange(event.target.value)}
    >
      <IonSelectOption value="noaccess">
        {t('artifactSharing.noaccess')}
      </IonSelectOption>
      <IonSelectOption value="readwrite">
        {t('artifactSharing.readwrite')}
      </IonSelectOption>
      <IonSelectOption value="readonly">
        {t('artifactSharing.readonly')}
      </IonSelectOption>
    </IonSelect>
  );
};
