import { IonSelect, IonSelectOption } from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface Props {
  label?: string;
  accessLevel: 'noaccess' | 'readwrite' | 'readonly' | 'readadd' | 'coowner';
  onChange: (
    level: 'noaccess' | 'readwrite' | 'readonly' | 'readadd' | 'coowner',
  ) => void;
}

export const ArtifactCollectionSharingAccessLevel: React.FC<Props> = (
  props,
) => {
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
      <IonSelectOption value="readadd">
        {t('artifactSharing.readadd')}
      </IonSelectOption>
      <IonSelectOption value="readonly">
        {t('artifactSharing.readonly')}
      </IonSelectOption>
      <IonSelectOption value="coowner">
        {t('artifactSharing.owner')}
      </IonSelectOption>
    </IonSelect>
  );
};
