import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
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

export const ImportExport: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<(ImportJob | ExportJob)[]>([]);
  const { startProgressBar, ProgressBar } = useProgressBar();

  useEffect(() => {
    fetchImportJobs();
    const jobHandler = async (
      _: EventName,
      data: EventData[EventName.JobCompleted],
    ) => {
      const importExportJobs = await trpc.job.getImportExportJobs.query();
      setJobs(importExportJobs);
      const eventJob = importExportJobs.find((job) => job.id === data.jobId);
      if (!eventJob) return
      if (eventJob.type === JobType.Export) {
        const url = await trpc.file.getFileUrlByJobId.query({ jobId: eventJob.id })
        if (!url) return
        window.open(url, '_blank')
      }
    }

    eventManager.addEventListener(EventName.JobCompleted, jobHandler);
    return () => {
      eventManager.removeEventListener(EventName.JobCompleted, jobHandler);
    };
  }, []);

  const fetchImportJobs = async () => {
    const progress = startProgressBar();
    const importExportJobs = await trpc.job.getImportExportJobs.query();
    setJobs(importExportJobs);
    progress.dismiss();
  };

  const beginExport = async (type: ExportJobType) => {
    const jobId = await trpc.job.createExportJob.mutate({ type });
    await trpc.job.startJob.mutate({ id: jobId });
  }

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
            <div slot="content">
              <IonText>{t('importExport.jobs.options.markdown.subtext')}</IonText>
              <IonButton onClick={() => beginExport(ExportJobType.Markdown)}>{t('importExport.export')}</IonButton>
            </div>
          </IonAccordion>
          <IonAccordion value="fourth">
            <IonItem slot="header">
              <IonLabel>{t('importExport.jobs.options.json')}</IonLabel>
            </IonItem>
            <div slot="content">
              <IonButton onClick={() => beginExport(ExportJobType.Json)}>{t('importExport.export')}</IonButton>
            </div>
          </IonAccordion>
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};
