import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonNote } from '@ionic/react';
import {
    arrowDown,
  document as documentIcon,
} from 'ionicons/icons';
import { ImportFormat, JobErrorCode, type JobSummary } from '@feynote/prisma/types';

const ImportJobsContainer = styled.div`
  max-height: 50vh;
  overflow-y: auto;
`;

interface Props {
  jobs: JobSummary[];
  hasMoreJobs: boolean;
  getMoreJobs: () => Promise<void>;
}

export const ImportJobList: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const formatToTranslationString = {
    [ImportFormat.Logseq]: t('importJobList.format.logseq'),
    [ImportFormat.Obsidian]: t('importJobList.format.obsidian'),
  }
  const ImportErrorCodeToTranslationString = {
    [JobErrorCode.UnknownError]: t('importJobList.error.unknown'),
  }

  return (
    <ImportJobsContainer>
      <h2>{t('importJobList.title')}</h2>
      <IonList>
        { props.jobs.map((job, idx) => {
          const formatTranslation = job.meta.importFormat ? formatToTranslationString[job.meta.importFormat] : t('importJobList.format.unknown')

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
                <h3>{formatTranslation}</h3>
                <p>{job.createdAt.toString()}</p>
              </IonLabel>
              {job.meta.error && <IonNote color="danger">{ImportErrorCodeToTranslationString[job.meta.error] || t('importJobList.error.unknown')}</IonNote>}
            </IonItem>
          )
        })}
      </IonList>
      {props.hasMoreJobs && (
        <>
          <IonButton fill="clear" onClick={() => props.getMoreJobs()}>
            {t('importJobList.showMore')}
            <IonIcon icon={arrowDown} />
          </IonButton>
        </>
      )}
    </ImportJobsContainer>
  );
};
