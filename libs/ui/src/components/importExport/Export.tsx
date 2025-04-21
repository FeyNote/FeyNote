import {
  IonAccordion,
  IonAccordionGroup,
  IonContent,
  IonItem,
  IonLabel,
  IonPage,
} from '@ionic/react';
import { t } from 'i18next';
import { ExportZip } from './ExportZip';
import { ExportJobType } from '@feynote/prisma/types';
import { PaneNav } from '../pane/PaneNav';

export const Export: React.FC = () => {
  return (
    <IonPage>
      <PaneNav title={t('export.title')} />
      <IonContent className="ion-padding">
        <IonAccordionGroup>
          <IonAccordion value="third">
            <IonItem slot="header">
              <IonLabel>{t('export.options.markdown')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ExportZip type={ExportJobType.Markdown} />
            </div>
          </IonAccordion>
          <IonAccordion value="fourth">
            <IonItem slot="header">
              <IonLabel>{t('export.options.json')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ExportZip type={ExportJobType.Json} />
            </div>
          </IonAccordion>
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};
