import { IonButton, IonContent, IonIcon, IonItem, IonList, IonPage } from '@ionic/react';
import { arrowDown } from 'ionicons/icons';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { ImportJobList } from './ImportJobList';
import { useContext, useEffect, useState } from 'react';
import { useProgressBar } from '../../utils/useProgressBar';
import { trpc } from '../../utils/trpc';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import type { EventData } from '../../context/events/EventData';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import type { JobSummary } from '@feynote/prisma/types';
import { JobType } from '@prisma/client';

export const Import: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<(JobSummary)[]>([]);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const { startProgressBar, ProgressBar } = useProgressBar();
  const { navigate } = useContext(PaneContext);

  useEffect(() => {
    getMoreImportJobs();
    const jobCompletionHandler = async (
      _: EventName,
      __: EventData[EventName.JobCompleted],
    ) => {
      await refreshJobs()
    };

    eventManager.addEventListener(EventName.JobCompleted, jobCompletionHandler);
    return () => {
      eventManager.removeEventListener(
        EventName.JobCompleted,
        jobCompletionHandler,
      );
    };
  }, []);

  const refreshJobs = async () => {
    const progress = startProgressBar();
    const importDto = await trpc.job.getJobs.query({
      limit: jobs.length,
    });
    setJobs(importDto.jobs);
    setHasMoreJobs(importDto.totalCount <= importDto.jobs.length);
    progress.dismiss();
  };

  const getMoreImportJobs = async () => {
    const progress = startProgressBar();
    const importjobsDTO = await trpc.job.getJobs.query({
      offset: jobs.length,
      limit: 5,
      type: JobType.Import,
    });
    const totalJobs = [...jobs, ...importjobsDTO.jobs];
    setJobs(totalJobs);
    setHasMoreJobs(importjobsDTO.totalCount > totalJobs.length);
    progress.dismiss();
  };

  return (
    <IonPage>
      <PaneNav title={t('import.title')} />
      <IonContent className="ion-padding">
        {ProgressBar}
        {!!jobs.length && (
          <ImportJobList hasMoreJobs={hasMoreJobs} jobs={jobs} getMoreJobs={getMoreImportJobs} />
        )}
        <br/>
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
