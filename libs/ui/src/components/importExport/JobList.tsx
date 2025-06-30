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
  ExportFormat,
  ImportFormat,
  JobErrorCode,
  type JobSummary,
} from '@feynote/prisma/types';
import { JobStatus } from '@prisma/client';
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

  const formatToTranslationString = {
    [ImportFormat.Logseq]: t('jobList.format.logseq'),
    [ImportFormat.Obsidian]: t('jobList.format.obsidian'),
    [ExportFormat.Json]: t('jobList.format.json'),
    [ExportFormat.Markdown]: t('jobList.format.markdown'),
  };
  const ErrorCodeToTranslationString = {
    [JobErrorCode.UnknownError]: t('jobList.error.unknown'),
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

          return (
            <IonItem
              key={idx}
              button
              onClick={() => props.jobClickHandler(job.id)}
            >
              <IonIcon icon={documentIcon} slot="start" />
              <IonLabel>
                <h3>{formatTranslation}</h3>
                <p>{job.createdAt.toString()}</p>
                {job.status === JobStatus.Failed && (
                  <IonNote color="danger">
                    {(job.meta.error &&
                      ErrorCodeToTranslationString[job.meta.error]) ||
                      t('jobList.error.unknown')}
                  </IonNote>
                )}
                {job.status === JobStatus.Success && (
                  <IonNote color="success">{t('jobList.success')}</IonNote>
                )}
                {job.status === JobStatus.InProgress && (
                  <>
                    <IonNote color="primary">{t('jobList.inProgress')}</IonNote>
                    <ProgressBar
                      progress={Math.min(job.progress / 100, 0.01)}
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
