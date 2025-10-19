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
import { AiFillFileMarkdown, AiFillFileText, FaGoogleDrive, SiLogseq, SiObsidian, TbFileTypeDocx } from '../AppIcons';
import { PaneTransition, useGlobalPaneContext } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';

const ImportOptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px 16px;
`

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
  logo: ReactNode,
  title: string,
  type: ImportFormat
}[] = [
  {
    logo: <TbFileTypeDocx />,
    title: 'import.options.docx',
    type: 'docx'
  },
  {
    logo: <FaGoogleDrive />,
    title: 'import.options.gdrive',
    type: 'docx'
  },
  {
    logo: <SiObsidian />,
    title: 'import.options.obsidian',
    type: 'obsidian'
  },
  {
    logo: <SiLogseq />,
    title: 'import.options.logseq',
    type: 'logseq'
  },
  {
    logo: <AiFillFileMarkdown />,
    title: 'import.options.markdown',
    type: 'markdown'
  },
  {
    logo: <AiFillFileText />,
    title: 'import.options.text',
    type: 'text',
  },
]
const NUM_OF_INITAL_JOBS_SHOWN = 5;
const REFRESH_JOBS_INTERVAL_SECONDS = 2000;

export const Import: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const { navigate } = useGlobalPaneContext();

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
        <ImportOptionsHeader>Import Options</ImportOptionsHeader>
        <ImportOptionsContainer>
          { IMPORT_OPTIONS.map((option, i) => {
              return (
                <StyledImportCard key={`option-${i}`} asChild>
                  <Button onClick={() => {
                    if (option.type !== 'gdrive') {
                      navigate(
                        undefined, // Open in currently focused pane rather than in specific pane
                        PaneableComponent.ImportFileUpload,
                        {
                          format: option.type,
                        },
                        PaneTransition.Push,
                      );
                      return
                    }
                    // TODO: Enable GFP
                  }}>
                    {option.logo}
                    <ImportOptionTitle>{t(option.title)}</ImportOptionTitle>
                  </Button>
                </StyledImportCard>
              )
            })
          }
        </ImportOptionsContainer>
      </IonContent>
    </IonPage>
  );
};
