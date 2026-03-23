import { PaneNav } from '../pane/PaneNav';
import {
  PaneContent,
  PaneContentContainer,
} from '../pane/PaneContentContainer';
import { useTranslation } from 'react-i18next';
import { JobList } from './JobList';
import { useEffect, useRef, useState } from 'react';
import { getJobsAction } from '../../actions/getJobsAction';
import type { ImportFormat, JobSummary } from '@feynote/prisma/types';
import styled from 'styled-components';
import { Heading, Text } from '@radix-ui/themes';
import {
  AiFillFileMarkdown,
  SiLogseq,
  SiObsidian,
  TbFileTypeDocx,
  FaGoogleDrive,
  TfiText,
} from '../AppIcons';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { usePaneContext } from '../../context/pane/PaneContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
`;

const FormatLabel = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormatRow = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 150ms;
  font-size: 20px;

  &:hover {
    background: var(--general-background-hover);
  }
`;

const IMPORT_OPTIONS: {
  component: React.FC;
  title: string;
  description: string;
  format: ImportFormat;
}[] = [
  {
    component: TbFileTypeDocx,
    title: 'import.options.docx',
    description: 'import.options.docx.description',
    format: 'docx',
  },
  {
    component: FaGoogleDrive,
    title: 'import.options.gDrive',
    description: 'import.options.gDrive.description',
    format: 'gDrive',
  },
  {
    component: SiObsidian,
    title: 'import.options.obsidian',
    description: 'import.options.obsidian.description',
    format: 'obsidian',
  },
  {
    component: SiLogseq,
    title: 'import.options.logseq',
    description: 'import.options.logseq.description',
    format: 'logseq',
  },
  {
    component: AiFillFileMarkdown,
    title: 'import.options.markdown',
    description: 'import.options.markdown.description',
    format: 'markdown',
  },
  {
    component: TfiText,
    title: 'import.options.text',
    description: 'import.options.text.description',
    format: 'text',
  },
];
const NUM_OF_INITAL_JOBS_SHOWN = 5;
const REFRESH_JOBS_INTERVAL_SECONDS = 2000;

export const Import: React.FC = () => {
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const { navigate } = usePaneContext();

  useEffect(() => {
    getMoreJobs();
    const refreshInterval = setInterval(() => {
      refreshJobs();
    }, REFRESH_JOBS_INTERVAL_SECONDS);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const refreshJobs = async () => {
    try {
      const importDto = await getJobsAction({
        limit: jobsRef.current.length || NUM_OF_INITAL_JOBS_SHOWN,
        type: 'import',
      });
      setJobs(importDto.jobs);
    } catch (e) {
      console.error(e);
    }
  };

  const getMoreJobs = async () => {
    try {
      const importjobsDTO = await getJobsAction({
        offset: jobsRef.current.length,
        limit: NUM_OF_INITAL_JOBS_SHOWN,
        type: 'import',
      });
      const totalJobs = [...jobsRef.current, ...importjobsDTO.jobs];
      setJobs(totalJobs);
      setHasMoreJobs(importjobsDTO.totalCount > totalJobs.length);
    } catch (e) {
      handleTRPCErrors(e);
    }
  };

  const jobClickHandler = async (jobId: string) => {
    const job = jobs.find((job) => job.id === jobId);
    if (job?.status === 'success' && job.meta.importedArtifactIds?.length) {
      navigate(
        PaneableComponent.AllArtifacts,
        { initialImportJobId: jobId, workspaceId: null },
        PaneTransition.Push,
      );
    }
  };

  return (
    <PaneContentContainer>
      <PaneNav title={t('import.title')} />
      <PaneContent>
        <Heading as="h2" size="3" mt="2">
          {t('import.options.title')}
        </Heading>
        <OptionsGrid>
          {IMPORT_OPTIONS.map((option, i) => (
            <FormatRow
              key={`option-${i}`}
              onClick={() => {
                navigate(
                  PaneableComponent.ImportFileUpload,
                  { format: option.format },
                  PaneTransition.Push,
                );
              }}
            >
              <option.component />
              <FormatLabel>
                <Text size="2" weight="medium">
                  {t(option.title)}
                </Text>
                <Text size="1" color="gray">
                  {t(option.description)}
                </Text>
              </FormatLabel>
            </FormatRow>
          ))}
        </OptionsGrid>

        {!!jobs.length && (
          <JobList
            title={t('import.jobList')}
            hasMoreJobs={hasMoreJobs}
            jobs={jobs}
            getMoreJobs={getMoreJobs}
            jobClickHandler={jobClickHandler}
          />
        )}
      </PaneContent>
    </PaneContentContainer>
  );
};
