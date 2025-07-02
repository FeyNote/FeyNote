import { IonContent, IonItem, IonList, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { JobList } from './JobList';
import { useContext, useEffect, useState } from 'react';
import { trpc } from '../../utils/trpc';
import { type JobSummary } from '@feynote/prisma/types';
import { useIndeterminateProgressBar } from '../../utils/useProgressBar';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';

const NUM_OF_INITAL_JOBS_SHOWN = 5;
const REFRESH_JOBS_INTERVAL_SECONDS = 2000;

export const Export: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const { navigate } = useContext(PaneContext);

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

  const openJobUrls = async (jobId: string) => {
    const urls = await trpc.file.getFileUrlsByJobId.query({
      jobId: jobId,
    });
    if (!urls.length) return;
    urls.forEach((url) => window.open(url, '_blank'));
  };

  const refreshJobs = async () => {
    const exportDto = await trpc.job.getJobs.query({
      // Avoids race condition of getMoreJobs and RefreshJobs being called on same render
      limit: jobs.length || NUM_OF_INITAL_JOBS_SHOWN,
      type: 'export',
    });
    setJobs(exportDto.jobs);
  };

  const getMoreJobs = async () => {
    const exportjobsDTO = await trpc.job.getJobs.query({
      offset: jobs.length,
      limit: NUM_OF_INITAL_JOBS_SHOWN,
      type: 'export',
    });
    const totalJobs = [...jobs, ...exportjobsDTO.jobs];
    setJobs(totalJobs);
    setHasMoreJobs(exportjobsDTO.totalCount > totalJobs.length);
  };

  return (
    <IonPage>
      <PaneNav title={t('export.title')} />
      <IonContent className="ion-padding">
        {ProgressBar}
        {!!jobs.length && (
          <JobList
            title={t('export.jobList')}
            hasMoreJobs={hasMoreJobs}
            jobs={jobs}
            getMoreJobs={getMoreJobs}
            jobClickHandler={openJobUrls}
          />
        )}
        <br />
        <IonList>
          <IonItem
            lines="none"
            button
            onClick={() => {
              navigate(PaneableComponent.ExportToJson, {}, PaneTransition.Push);
            }}
            target="_blank"
            detail={true}
          >
            {t('export.options.json')}
          </IonItem>
          <IonItem
            lines="none"
            button
            onClick={() => {
              navigate(
                PaneableComponent.ExportToMarkdown,
                {},
                PaneTransition.Push,
              );
            }}
            target="_blank"
            detail={true}
          >
            {t('export.options.markdown')}
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
