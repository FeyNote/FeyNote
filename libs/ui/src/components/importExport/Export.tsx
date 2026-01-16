import { IonContent, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { JobList } from './JobList';
import { useEffect, useState, type ReactNode } from 'react';
import { trpc } from '../../utils/trpc';
import type { ExportFormat, JobSummary } from '@feynote/prisma/types';
import { useIndeterminateProgressBar } from '../../utils/useProgressBar';
import styled from 'styled-components';
import { AiFillFileMarkdown, BsFiletypeJson } from '../AppIcons';
import { Button, Card } from '@radix-ui/themes';

const ExportOptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px 16px;
`;

const StyledExportCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  font-size: 32px;
  width: 200px;
`;

const ExportOptionsHeader = styled.h2`
  text-align: center;
  width: 100%;
  padding-bottom: 16px;
`;

const ExportOptionTitle = styled.div`
  weight: bold;
  font-size: 16px;
`;

const ExportOptionSubtext = styled.div`
  padding-top: 16px;
  font-size: 16px;
  opacity: 0.7;
  font-style: italic;
  text-align: center;
`;

const EXPORT_OPTIONS: {
  component: ReactNode;
  title: string;
  format: ExportFormat;
}[] = [
  {
    component: <BsFiletypeJson />,
    title: 'export.options.json',
    format: 'json',
  },
  {
    component: <AiFillFileMarkdown />,
    title: 'export.options.markdown',
    format: 'markdown',
  },
];
const NUM_OF_INITAL_JOBS_SHOWN = 5;
const REFRESH_JOBS_INTERVAL_SECONDS = 2000;

export const Export: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
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

  const _export = async (format: ExportFormat) => {
    await trpc.job.createExportJob.mutate({
      format: format,
    });
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
        <ExportOptionsHeader>{t('export.options.title')}</ExportOptionsHeader>
        <ExportOptionsContainer>
          {EXPORT_OPTIONS.map((option, i) => {
            return (
              <StyledExportCard key={`option-${i}`} asChild>
                <Button onClick={() => _export(option.format)}>
                  {option.component}
                  <ExportOptionTitle>{t(option.title)}</ExportOptionTitle>
                </Button>
              </StyledExportCard>
            );
          })}
        </ExportOptionsContainer>
        <ExportOptionSubtext>{t('export.options.subtext')}</ExportOptionSubtext>
      </IonContent>
    </IonPage>
  );
};
