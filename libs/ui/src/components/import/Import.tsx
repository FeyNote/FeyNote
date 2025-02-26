import {
  IonAccordion,
  IonAccordionGroup,
  IonContent,
  IonItem,
  IonLabel,
  IonPage,
} from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { ImportJobType } from '@prisma/client';
import { ImportFromFile } from './ImportFromFile';
import { ImportJobsTable } from './ImportJobsTable';
import { useEffect, useState } from 'react';
import { useProgressBar } from '../../utils/useProgressBar';
import { trpc } from '../../utils/trpc';
import { ImportJobDTO } from '@feynote/global-types';

export const Import: React.FC = () => {
  const { t } = useTranslation();
  const [importJobs, setImportJobs] = useState<ImportJobDTO[]>([]);
  const { startProgressBar, ProgressBar } = useProgressBar();

  useEffect(() => {
    fetchImportJobs();
  }, []);

  const fetchImportJobs = async () => {
    const progress = startProgressBar();
    const importJobDTOs = await trpc.import.getImportJobs.query();
    setImportJobs(importJobDTOs);
    progress.dismiss();
  };

  return (
    <IonPage>
      <PaneNav title={t('import.title')} />
      <IonContent className="ion-padding">
        {ProgressBar}
        {!!importJobs.length && <ImportJobsTable fetchImportJobs={fetchImportJobs} importJobs={importJobs} />}
        <IonAccordionGroup>
          <IonAccordion value="first">
            <IonItem slot="header">
              <IonLabel>{t('import.jobs.options.obsidian')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ImportFromFile
                fetchImportJobs={fetchImportJobs}
                type={ImportJobType.Obsidian}
              />
            </div>
          </IonAccordion>
          <IonAccordion value="second">
            <IonItem slot="header">
              <IonLabel>{t('import.jobs.options.logseq')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ImportFromFile
                fetchImportJobs={fetchImportJobs}
                type={ImportJobType.Logseq}
              />
            </div>
          </IonAccordion>
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};
