import { IonContent, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { GraphRenderer } from './GraphRenderer';

export const Graph: React.FC = () => {
  const { t } = useTranslation();
  return (
    <IonPage>
      <PaneNav title={t('graph.title')} />
      <IonContent>
        <GraphRenderer />
      </IonContent>
    </IonPage>
  );
};
