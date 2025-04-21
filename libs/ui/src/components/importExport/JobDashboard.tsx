import { IonContent, IonItem, IonList, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { JobsTable } from './JobsTable';
import { useContext, useEffect, useState } from 'react';
import { useProgressBar } from '../../utils/useProgressBar';
import { trpc } from '../../utils/trpc';
import { type ExportJob, type ImportJob } from '@feynote/prisma/types';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import type { EventData } from '../../context/events/EventData';
import { JobType } from '@prisma/client';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';

export const JobDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<(ImportJob | ExportJob)[]>([]);
  const { startProgressBar, ProgressBar } = useProgressBar();
  const { navigate } = useContext(PaneContext);

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
        {!!jobs.length && <JobsTable jobs={jobs} />}
        <IonList>
          <IonItem
            lines="none"
            button
            onClick={() => {
              navigate(
                PaneableComponent.ImportFromLogseq,
                {},
                PaneTransition.Push,
              );
            }}
            target="_blank"
            detail={true}
          >
            {t('importFromLogseq.title')}
          </IonItem>
          <IonItem
            lines="none"
            button
            onClick={() => {
              navigate(
                PaneableComponent.ImportFromObsidian,
                {},
                PaneTransition.Push,
              );
            }}
            target="_blank"
            detail={true}
          >
            {t('importFromObsidian.title')}
          </IonItem>
          <IonItem
            lines="none"
            button
            onClick={() => {
              navigate(PaneableComponent.Export, {}, PaneTransition.Push);
            }}
            target="_blank"
            detail={true}
          >
            {t('export.title')}
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
