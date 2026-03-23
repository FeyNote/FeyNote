import { PaneNav } from '../pane/PaneNav';
import {
  PaneContent,
  PaneContentContainer,
} from '../pane/PaneContentContainer';
import { useTranslation } from 'react-i18next';
import { JobList } from './JobList';
import { useEffect, useRef, useState } from 'react';
import { trpc } from '../../utils/trpc';
import { getJobsAction } from '../../actions/getJobsAction';
import type { ExportFormat, JobSummary } from '@feynote/prisma/types';
import styled from 'styled-components';
import { Heading, Text } from '@radix-ui/themes';
import { AiFillFileMarkdown, BsFiletypeJson } from '../AppIcons';

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

const EXPORT_OPTIONS: {
  component: React.FC;
  title: string;
  description: string;
  format: ExportFormat;
}[] = [
  {
    component: BsFiletypeJson,
    title: 'export.options.json',
    description: 'export.options.json.description',
    format: 'json',
  },
  {
    component: AiFillFileMarkdown,
    title: 'export.options.markdown',
    description: 'export.options.markdown.description',
    format: 'markdown',
  },
];
const NUM_OF_INITAL_JOBS_SHOWN = 5;
const REFRESH_JOBS_INTERVAL_SECONDS = 2000;

export const Export: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);

  useEffect(() => {
    getMoreJobs();
    const refreshInterval = setInterval(() => {
      refreshJobs();
    }, REFRESH_JOBS_INTERVAL_SECONDS);

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

  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const refreshJobs = async () => {
    const exportDto = await getJobsAction({
      limit: jobsRef.current.length || NUM_OF_INITAL_JOBS_SHOWN,
      type: 'export',
    });
    setJobs(exportDto.jobs);
  };

  const getMoreJobs = async () => {
    const exportjobsDTO = await getJobsAction({
      offset: jobsRef.current.length,
      limit: NUM_OF_INITAL_JOBS_SHOWN,
      type: 'export',
    });
    const totalJobs = [...jobsRef.current, ...exportjobsDTO.jobs];
    setJobs(totalJobs);
    setHasMoreJobs(exportjobsDTO.totalCount > totalJobs.length);
  };

  const _export = async (format: ExportFormat) => {
    await trpc.job.createExportJob.mutate({
      format: format,
    });
    await refreshJobs();
  };

  return (
    <PaneContentContainer>
      <PaneNav title={t('export.title')} />
      <PaneContent>
        <Heading as="h2" size="3" mt="2">
          {t('export.options.title')}
        </Heading>
        <Text size="1" color="gray">
          {t('export.options.subtext')}
        </Text>
        <OptionsGrid>
          {EXPORT_OPTIONS.map((option, i) => (
            <FormatRow
              key={`option-${i}`}
              onClick={() => _export(option.format)}
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
            title={t('export.jobList')}
            hasMoreJobs={hasMoreJobs}
            jobs={jobs}
            getMoreJobs={getMoreJobs}
            jobClickHandler={openJobUrls}
          />
        )}
      </PaneContent>
    </PaneContentContainer>
  );
};
