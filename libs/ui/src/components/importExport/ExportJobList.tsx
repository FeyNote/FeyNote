import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { IonIcon, IonItem, IonLabel, IonList, IonNote } from '@ionic/react';
import {
  document as documentIcon,
} from 'ionicons/icons';
import { ExportFormat, JobErrorCode, type JobSummary } from '@feynote/prisma/types';
import { JobType } from '@prisma/client';

const ImportJobsContainer = styled.div`
  max-height: 50vh;
  overflow-y: auto;
`;

interface Props {
  jobs: JobSummary[];
}

export const ExportJobList: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const formatToTranslationString = {
    [ExportFormat.Markdown]: t('exportJobList.format.logseq'),
    [ExportFormat.Json]: t('exportJobList.format.obsidian'),
  }
  const ImportErrorCodeToTranslationString = {
    [JobErrorCode.UnknownError]: t('exportJobList.error.unknown'),
  }

  return (
    <ImportJobsContainer>
      <h2>{t('exportJobList.title')}</h2>
      <IonList>
        { props.jobs.map((job, idx) => {
          if (job.type !== JobType.Export || !job.meta.exportFormat) return null
          const formatTranslation = formatToTranslationString[job.meta.exportFormat] || t('exportJobList.format.unknown')

          return (
            <IonItem
              key={idx}
              button
              onClick={() => {
                console.log(`Clicked on job: ${job.id}`);
              }}
            >
              <IonIcon icon={documentIcon} slot="start" />
              <IonLabel>
                {formatTranslation}
              </IonLabel>
              {job.meta.error && <IonNote color="danger">{ImportErrorCodeToTranslationString[job.meta.error] || t('exportJobList.error.unknown')}</IonNote>}
            </IonItem>
          )
        })}
      </IonList>
    </ImportJobsContainer>
  );
};
