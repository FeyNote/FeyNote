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
import { ImportFromFile } from './ImportFromFile';
import { ImportJobsTable } from './ImportExportJobsTable';
import { useEffect, useState } from 'react';
import { useProgressBar } from '../../utils/useProgressBar';
import { trpc } from '../../utils/trpc';
import {
  ImportJobType,
  type ExportJob,
  type ImportJob,
} from '@feynote/prisma/types';

export const ImportExport: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<(ImportJob | ExportJob)[]>([]);
  const { startProgressBar, ProgressBar } = useProgressBar();

  useEffect(() => {
    fetchImportJobs();
  }, []);

  const fetchImportJobs = async () => {
    const progress = startProgressBar();
    const importJobDTOs = await trpc.job.getImportExportJobs.query();
    setJobs(importJobDTOs);
    progress.dismiss();
  };

  return (
    <IonPage>
      <PaneNav title={t('importExport.title')} />
      <IonContent className="ion-padding">
        {ProgressBar}
        {!!jobs.length && (
          <ImportJobsTable
            fetchImportJobs={fetchImportJobs}
            importJobs={jobs}
          />
        )}
        <IonAccordionGroup>
          <IonAccordion value="first">
            <IonItem slot="header">
              <IonLabel>{t('importExport.jobs.options.obsidian')}</IonLabel>
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
              <IonLabel>{t('importExport.jobs.options.logseq')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ImportFromFile
                fetchImportJobs={fetchImportJobs}
                type={ImportJobType.Logseq}
              />
            </div>
          </IonAccordion>
          <IonAccordion value="third">
            <IonItem slot="header">
              <IonLabel>{t('importExport.jobs.options.markdown')}</IonLabel>
            </IonItem>
            <div slot="content">Export as Markdown</div>
          </IonAccordion>
          <IonAccordion value="fourth">
            <IonItem slot="header">
              <IonLabel>{t('importExport.jobs.options.json')}</IonLabel>
            </IonItem>
            <div slot="content">Export as JSON</div>
          </IonAccordion>
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};
