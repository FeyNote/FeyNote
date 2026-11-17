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
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import { EXPORT_OPTIONS } from './EXPORT_OPTIONS';
import { ExportFormatLabel } from './ExportFormatLabel';

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
`;

const FormatRow = styled.button`
  all: unset;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 150ms;

  &:hover {
    background: var(--general-background-hover);
  }
`;

export const Export: React.FC = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  useEffect(() => {
    getJobs();
    return eventManager.addEventListener(EventName.JobUpdated, async (_) =>
      getJobs(),
    );
  }, []);

  const openJobUrls = async (jobId: string) => {
    const urls = await trpc.file.getFileUrlsByJobId
      .query({
        jobId: jobId,
      })
      .catch((e) => {
        handleTRPCErrors(e);
      });

    if (!urls?.length) return;
    urls.forEach((url) => window.open(url, '_blank'));
  };

  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const getJobs = async () => {
    const jobs = await getJobsAction({
      type: 'export',
    }).catch((e) => {
      handleTRPCErrors(e);
    });
    if (!jobs) return;

    setJobs(jobs);
  };

  const _export = async (format: ExportFormat) => {
    await trpc.job.createExportJob
      .mutate({
        format: format,
      })
      .catch((e) => {
        handleTRPCErrors(e);
      });
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
              <ExportFormatLabel option={option} />
            </FormatRow>
          ))}
        </OptionsGrid>

        {!!jobs.length && (
          <JobList
            title={t('export.jobList')}
            jobs={jobs}
            jobClickHandler={openJobUrls}
          />
        )}
      </PaneContent>
    </PaneContentContainer>
  );
};
