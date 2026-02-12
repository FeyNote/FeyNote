import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
} from '@ionic/react';
import { arrowDown, document as documentIcon } from 'ionicons/icons';
import {
  type ExportFormat,
  type ImportFormat,
  type JobSummary,
} from '@feynote/prisma/types';
import { ProgressBar } from '../info/ProgressBar';

const JobsContainer = styled.div`
  max-height: 50vh;
  overflow-y: auto;
`;

interface Props {
  jobs: JobSummary[];
  hasMoreJobs: boolean;
  getMoreJobs: () => Promise<void>;
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
    <JobsContainer>
      <h2>{props.title}</h2>
      <IonList>
        {props.jobs.map((job, idx) => {
          const format = job.meta.importFormat ?? job.meta.exportFormat;
          const formatTranslation = format
            ? formatToTranslationString[format]
            : t('jobList.format.unknown');

          // Only show as btn for completed export jobs or completed import jobs with associated artifacts
          const showAsBtn =
            job.status === 'success' &&
            (job.type === 'export' ||
              (job.type === 'import' &&
                !!job.meta.importedArtifactIds?.length));

          return (
            <IonItem
              key={idx}
              button={showAsBtn}
              onClick={() => props.jobClickHandler(job.id)}
            >
              <IonIcon icon={documentIcon} slot="start" />
              <IonLabel>
                <h3>{formatTranslation}</h3>
                <p>{job.createdAt.toLocaleString()}</p>
                {job.status === 'failed' && (
                  <IonNote color="danger">
                    {(job.meta.error &&
                      ErrorCodeToTranslationString[job.meta.error]) ||
                      t('jobList.error.unknown')}
                  </IonNote>
                )}
                {job.status === 'success' && (
                  <IonNote color="success">{t('jobList.success')}</IonNote>
                )}
                {job.status === 'inprogress' && (
                  <>
                    <IonNote color="primary">{t('jobList.inProgress')}</IonNote>
                    <ProgressBar
                      progress={Math.max(job.progress / 100, 0.01)}
                    />
                  </>
                )}
              </IonLabel>
            </IonItem>
          );
        })}
      </IonList>
      {props.hasMoreJobs && (
        <IonButton fill="clear" onClick={() => props.getMoreJobs()}>
          {t('jobList.showMore')}
          <IonIcon icon={arrowDown} />
        </IonButton>
      )}
    </JobsContainer>
  );
};
