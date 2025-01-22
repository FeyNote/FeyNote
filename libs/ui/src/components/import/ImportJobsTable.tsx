import { Fragment } from 'react';
import { ImportJobDTO } from '@feynote/global-types';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { IonIcon, IonSpinner } from '@ionic/react';
import { checkmarkCircle, alertCircle, ellipsisHorizontalCircle } from 'ionicons/icons';
import { JobStatus } from '@prisma/client';

const ImportJobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 30px;
  grid-auto-rows: 60px;
  gap: 1rem;
  justify-items: center;
  align-items: center;
  margin-bottom: 16px;
`;

const GridHeader = styled.div`
  font-weight: bold;
  text-align: center;
  padding: 12px;
`;

const ImportJobsContainer = styled.div`
  max-height: 50vh;
  overflow-y: auto;
`;

interface Props {
  importJobs: ImportJobDTO[];
  fetchImportJobs:() => Promise<void>;
}

export const ImportJobsTable: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <ImportJobsContainer>
      <h2>{t('import.jobs.title')}</h2>
      <ImportJobGrid>
        <GridHeader>{t('import.jobs.table.columns.title')}</GridHeader>
        <GridHeader>{t('import.jobs.table.columns.type')}</GridHeader>
        <GridHeader>{t('import.jobs.table.columns.createdAt')}</GridHeader>
        <GridHeader>{t('import.jobs.table.columns.status')}</GridHeader>
        {props.importJobs.map((job, idx) => {
          let status = (
            <IonIcon
              icon={ellipsisHorizontalCircle}
              size="large"
              title={t('import.jobs.table.columns.status.notStarted')}
            />
          );
          switch (job.status) {
            case JobStatus.Success:
              status = (
                <IonIcon
                  title={t('import.jobs.table.columns.status.success')}
                  color="success"
                  icon={checkmarkCircle}
                  size="large"
                />
              );
              break;
            case JobStatus.InProgress:
              status = <IonSpinner name="circular" />;
              break;
            case JobStatus.Failed:
              status = (
                <IonIcon
                  title={t('import.jobs.table.columns.status.failed')}
                  color="danger"
                  icon={alertCircle}
                  size="large"
                />
              );
              break;
          }
          return (
            <Fragment key={idx}>
              <div key={`${idx}-1`}>{job.title}</div>
              <div key={`${idx}-2`}>{job.type}</div>
              <div key={`${idx}-3`}>
                {job.createdAt.toLocaleString()}
              </div>
              <div key={`${idx}-4`}>{status}</div>
            </Fragment>
          );
        })}
      </ImportJobGrid>
    </ImportJobsContainer>
  );
};
