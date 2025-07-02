import { IonContent, IonItem, IonList, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { JobList } from './JobList';
import { useContext, useEffect, useState } from 'react';
import { trpc } from '../../utils/trpc';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import type { JobSummary } from '@feynote/prisma/types';
import { useIndeterminateProgressBar } from '../../utils/useProgressBar';

const NUM_OF_INITAL_JOBS_SHOWN = 5;
const REFRESH_JOBS_INTERVAL_SECONDS = 2000;

export const Import: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const { navigate } = useContext(PaneContext);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();

  useEffect(() => {
    const progress = startProgressBar();
    getMoreJobs();
    const refreshInterval = setInterval(() => {
      refreshJobs();
    }, REFRESH_JOBS_INTERVAL_SECONDS);
    progress.dismiss();

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const refreshJobs = async () => {
    const importDto = await trpc.job.getJobs.query({
      // Avoids race condition of getMoreJobs and RefreshJobs being called on same render
      limit: jobs.length || NUM_OF_INITAL_JOBS_SHOWN,
      type: 'import',
    });
    setJobs(importDto.jobs);
  };

  const getMoreJobs = async () => {
    const importjobsDTO = await trpc.job.getJobs.query({
      offset: jobs.length,
      limit: NUM_OF_INITAL_JOBS_SHOWN,
      type: 'import',
    });
    const totalJobs = [...jobs, ...importjobsDTO.jobs];
    setJobs(totalJobs);
    setHasMoreJobs(importjobsDTO.totalCount > totalJobs.length);
  };

  const jobClickHandler = async (_: string) => {
    // TODO: Navigate user to page of all imported artifacts from job
  };

  return (
    <IonPage>
      <PaneNav title={t('import.title')} />
      <IonContent className="ion-padding">
        {ProgressBar}
        {!!jobs.length && (
          <JobList
            title={t('import.jobList')}
            hasMoreJobs={hasMoreJobs}
            jobs={jobs}
            getMoreJobs={getMoreJobs}
            jobClickHandler={jobClickHandler}
          />
        )}
        <br />
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
            {t('import.options.logseq')}
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
            {t('import.options.obsidian')}
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
