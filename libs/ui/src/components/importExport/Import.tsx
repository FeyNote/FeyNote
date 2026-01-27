import { IonContent, IonPage } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { JobList } from './JobList';
import { useEffect, useState, type ReactNode } from 'react';
import { trpc } from '../../utils/trpc';
import type { ImportFormat, JobSummary } from '@feynote/prisma/types';
import { useIndeterminateProgressBar } from '../../utils/useProgressBar';
import styled from 'styled-components';
import { Button, Card } from '@radix-ui/themes';
import {
  AiFillFileMarkdown,
  SiLogseq,
  SiObsidian,
  TbFileTypeDocx,
  SiGoogledocs,
  TfiText,
} from '../AppIcons';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { usePaneContext } from '../../context/pane/PaneContext';

const ImportOptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px 16px;
`;

const StyledImportCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  font-size: 32px;
  width: 200px;
`;

const ImportOptionsHeader = styled.h2`
  text-align: center;
  width: 100%;
  padding-bottom: 16px;
`;

const ImportOptionTitle = styled.div`
  weight: bold;
  font-size: 16px;
`;

const IMPORT_OPTIONS: {
  component: ReactNode;
  title: string;
  format: ImportFormat;
}[] = [
  {
    component: <TbFileTypeDocx />,
    title: 'import.options.docx',
    format: 'docx',
  },
  {
    component: <SiGoogledocs />,
    title: 'import.options.gDocs',
    format: 'gDocs',
  },
  {
    component: <SiObsidian />,
    title: 'import.options.obsidian',
    format: 'obsidian',
  },
  {
    component: <SiLogseq />,
    title: 'import.options.logseq',
    format: 'logseq',
  },
  {
    component: <AiFillFileMarkdown />,
    title: 'import.options.markdown',
    format: 'markdown',
  },
  {
    component: <TfiText />,
    title: 'import.options.text',
    format: 'text',
  },
];
const NUM_OF_INITAL_JOBS_SHOWN = 5;
const REFRESH_JOBS_INTERVAL_SECONDS = 2000;

export const Import: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const { navigate } = usePaneContext();

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
        <ImportOptionsHeader>{t('import.options.title')}</ImportOptionsHeader>
        <ImportOptionsContainer>
          {IMPORT_OPTIONS.map((option, i) => {
            return (
              <StyledImportCard key={`option-${i}`} asChild>
                <Button
                  onClick={() => {
                    navigate(
                      PaneableComponent.ImportFileUpload,
                      {
                        format: option.format,
                      },
                      PaneTransition.Push,
                    );
                    return;
                  }}
                >
                  {option.component}
                  <ImportOptionTitle>{t(option.title)}</ImportOptionTitle>
                </Button>
              </StyledImportCard>
            );
          })}
        </ImportOptionsContainer>
      </IonContent>
    </IonPage>
  );
};
