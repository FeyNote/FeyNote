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
  ExportJobType,
  ImportJobType,
  type ExportJob,
  type ImportJob,
} from '@feynote/prisma/types';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import type { EventData } from '../../context/events/EventData';
import { JobType } from '@prisma/client';
import { ExportZip } from './ExportZip';

export const ImportExport: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<(ImportJob | ExportJob)[]>([]);
  const { startProgressBar, ProgressBar } = useProgressBar();

  useEffect(() => {
    fetchJobs();
    const jobCompletionHandler = async (
      _: EventName,
      data: EventData[EventName.JobCompleted],
    ) => {
      const importExportJobs = await trpc.job.getImportExportJobs.query();
      setJobs(importExportJobs);
      const eventJob = importExportJobs.find((job) => job.id === data.jobId);
      if (!eventJob) return;
      if (eventJob.type === JobType.Export) {
        const url = await trpc.file.getFileUrlByJobId.query({
          jobId: eventJob.id,
        });
        if (!url) return;
        window.open(url, '_blank');
      }
    };

    eventManager.addEventListener(EventName.JobCompleted, jobCompletionHandler);
    return () => {
      eventManager.removeEventListener(
        EventName.JobCompleted,
        jobCompletionHandler,
      );
    };
  }, []);

  const fetchJobs = async () => {
    const progress = startProgressBar();
    const importExportJobs = await trpc.job.getImportExportJobs.query();
    setJobs(importExportJobs);
    progress.dismiss();
  };

  return (
    <IonPage>
      <PaneNav title={t('importExport.title')} />
      <IonContent className="ion-padding">
        {ProgressBar}
        {!!jobs.length && <ImportJobsTable jobs={jobs} />}
        <IonAccordionGroup>
          <IonAccordion value="first">
            <IonItem slot="header">
              <IonLabel>{t('importExport.options.obsidian')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ImportFromFile
                fetchJobs={fetchJobs}
                type={ImportJobType.Obsidian}
              />
            </div>
          </IonAccordion>
          <IonAccordion value="second">
            <IonItem slot="header">
              <IonLabel>{t('importExport.options.logseq')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ImportFromFile
                fetchJobs={fetchJobs}
                type={ImportJobType.Logseq}
              />
            </div>
          </IonAccordion>
          <IonAccordion value="third">
            <IonItem slot="header">
              <IonLabel>{t('importExport.options.markdown')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ExportZip fetchJobs={fetchJobs} type={ExportJobType.Markdown} />
            </div>
          </IonAccordion>
          <IonAccordion value="fourth">
            <IonItem slot="header">
              <IonLabel>{t('importExport.options.json')}</IonLabel>
            </IonItem>
            <div slot="content">
              <ExportZip fetchJobs={fetchJobs} type={ExportJobType.Json} />
            </div>
          </IonAccordion>
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};
