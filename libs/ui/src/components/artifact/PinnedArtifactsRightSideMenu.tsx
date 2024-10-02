import { IonCard, IonIcon } from '@ionic/react';
import { CompactIonItem } from '../CompactIonItem';
import { NowrapIonLabel } from '../NowrapIonLabel';
import { useTranslation } from 'react-i18next';
import { refresh } from 'ionicons/icons';

interface Props {
  reload: () => void;
}

export const PinnedArtifactsRightSideMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <IonCard>
      <CompactIonItem lines="none" onClick={() => props.reload()} button>
        <IonIcon icon={refresh} slot="start" />
        <NowrapIonLabel>{t('pinnedArtifacts.reload')}</NowrapIonLabel>
      </CompactIonItem>
    </IonCard>
  );
};
