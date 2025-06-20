import { IonContent, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { ExportZip } from './ExportZip';
import { ExportFormat } from '@feynote/prisma/types';

export const ExportToMarkdown: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <PaneNav title={t('exportToMarkdown.title')} />
      <IonContent className="ion-padding">
        <ExportZip type={ExportFormat.Markdown} />
      </IonContent>
    </IonPage>
  );
};
