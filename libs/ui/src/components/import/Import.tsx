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
import { useContext, useState } from 'react';
import { NullState } from '../info/NullState';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { ImportJobType } from '@prisma/client';

export const Import: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useContext(PaneContext);
  const [importJobs, setImportJobs] = useState([]);

  return (
    <IonPage>
      <PaneNav title={t('import.title')} />
      <IonContent>
        <IonList>
          {importJobs.length ? (
            <>
              <IonListHeader>
                <IonLabel>{t('import.jobs.title')}</IonLabel>
              </IonListHeader>
              {importJobs.map((job) => (
                <IonItem></IonItem>
              ))}
            </>
          ) : (
            <NullState
              className="ion-padding"
              title={t('import.jobs.nullState.title')}
              message={t('import.jobs.nullState.message')}
              icon={cloudDownload}
            />
          )}
        </IonList>
        <IonList>
          <IonItem
            lines="none"
            button
            target="_blank"
            detail={true}
            onClick={() => {
              navigate(
                PaneableComponent.ImportFile,
                {
                  type: ImportJobType.Obsidian,
                  title: t('import.jobs.options.obsidian'),
                },
                PaneTransition.Push,
              );
            }}
          >
            {t('import.jobs.options.obsidian')}
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
