import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
} from '@ionic/react';
import { cloudDownload } from 'ionicons/icons';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { NullState } from '../info/NullState';

export const Import: React.FC = () => {
  const { t } = useTranslation();
  const [importJobs, setImportJobs] = useState([]);

  return (
    <IonPage>
      <PaneNav title={t('import.title')} />
      <IonContent>
        <IonList>
          <IonListHeader>
            <IonLabel>{t('import.jobs.title')}</IonLabel>
          </IonListHeader>
          {importJobs.length ? (
            importJobs.map((job) => <IonItem></IonItem>)
          ) : (
            <NullState
              className="ion-padding"
              title={t('import.jobs.nullState.title')}
              message={t('import.jobs.nullState.message')}
              icon={cloudDownload}
            />
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};
