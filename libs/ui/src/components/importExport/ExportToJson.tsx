import { IonContent, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { ExportZip } from './ExportZip';
import { ExportFormat } from '@feynote/prisma/types';

export const ExportToJson: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <PaneNav title={t('exportToJson.title')} />
      <IonContent className="ion-padding">
        <ExportZip type={ExportFormat.Json} />
      </IonContent>
    </IonPage>
  );
};
