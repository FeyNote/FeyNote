import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Badge, Flex, Text } from '@radix-ui/themes';
import {
  type ExportFormat,
  type ImportFormat,
  type JobSummary,
} from '@feynote/prisma/types';
import { ProgressBar } from '../info/ProgressBar';

const JobRow = styled.div<{ $clickable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--general-background-hover);
  cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};

  &:hover {
    background: ${(props) =>
      props.$clickable ? 'var(--general-background-hover)' : 'transparent'};
  }
`;

const SectionHeader = styled.div`
  padding: 12px 16px 4px;
  margin-top: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-color-secondary);
  letter-spacing: 0.5px;
`;

interface Props {
  jobs: JobSummary[];
  title: string;
  jobClickHandler: (jobId: string) => Promise<void>;
}

export const JobList: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const formatToTranslationString: Record<
    NonNullable<ImportFormat | ExportFormat>,
    string
  > = {
    logseq: t('jobList.format.logseq'),
    obsidian: t('jobList.format.obsidian'),
    json: t('jobList.format.json'),
    markdown: t('jobList.format.markdown'),
    text: t('jobList.format.text'),
    docx: t('jobList.format.docx'),
    gDrive: t('jobList.format.gDrive'),
  };

  const ErrorCodeToTranslationString: Record<
    NonNullable<JobSummary['meta']['error']>,
    string
  > = {
    unknown_error: t('jobList.error.unknown'),
  };

  return (
    <div>
      <SectionHeader>{props.title}</SectionHeader>
      {props.jobs.map((job, idx) => {
        const format = job.meta.importFormat ?? job.meta.exportFormat;
        const formatTranslation = format
          ? formatToTranslationString[format]
          : t('jobList.format.unknown');

        const showAsBtn =
          job.status === 'success' &&
          ((job.type === 'export' && !job.meta.error) ||
            (job.type === 'import' && !!job.meta.importedArtifactIds?.length));

        return (
          <JobRow
            key={idx}
            $clickable={showAsBtn}
            onClick={() => showAsBtn && props.jobClickHandler(job.id)}
          >
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              <Text size="2" weight="medium">
                {formatTranslation}
              </Text>
              <Text size="1" color="gray">
                {job.createdAt.toLocaleString()}
              </Text>
              {job.status === 'inprogress' && (
                <div style={{ maxWidth: 200, paddingTop: 4 }}>
                  <ProgressBar progress={Math.max(job.progress / 100, 0.01)} />
                </div>
              )}
            </Flex>
            <Flex align="center">
              {job.status === 'failed' && (
                <Badge color="red" variant="soft">
                  {(job.meta.error &&
                    ErrorCodeToTranslationString[job.meta.error]) ||
                    t('jobList.error.unknown')}
                </Badge>
              )}
              {job.status === 'success' && (
                <Badge color="green" variant="soft">
                  {t('jobList.success')}
                </Badge>
              )}
              {(job.status === 'inprogress' || job.status === 'notstarted') && (
                <Badge color="blue" variant="soft">
                  {t('jobList.inProgress')}
                </Badge>
              )}
            </Flex>
          </JobRow>
        );
      })}
    </div>
  );
};
