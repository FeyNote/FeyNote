import { Fragment } from 'react';
import { ImportJobDTO } from '@feynote/global-types';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { IonIcon, IonSpinner } from '@ionic/react';
import { checkmarkCircle, alertCircle } from 'ionicons/icons';
import { JobStatus } from '@prisma/client';

const ImportJobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 50px;
  grid-auto-rows: 60px;
  gap: 1rem;
  justify-items: center;
`;

const GridItem = styled.div`
  overflow: auto;
  display: flex;
  justify-content: start;
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
}

export const ImportJobsTable: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <ImportJobsContainer>
      <h2>{t('import.jobs.title')}</h2>
      <ImportJobGrid>
        <GridHeader>{t('import.jobs.table.columns.title')}</GridHeader>
        <GridHeader>{t('import.jobs.table.columns.status')}</GridHeader>
        <GridHeader>{t('import.jobs.table.columns.type')}</GridHeader>
        <GridHeader>{t('import.jobs.table.columns.createdAt')}</GridHeader>
        {props.importJobs.map((job, idx) => {
          let status = (
            <IonIcon color="danger" icon={alertCircle} size="large" />
          );
          switch (job.status) {
            case JobStatus.Success:
              status = (
                <IonIcon color="green" icon={checkmarkCircle} size="large" />
              );
              break;
            case JobStatus.InProgress:
              status = <IonSpinner color="primary" name="circular" />;
              break;
          }
          return (
            <Fragment key={idx}>
              <GridItem key={`${idx}-1`}>{job.title}</GridItem>
              <GridItem key={`${idx}-2`}>{status}</GridItem>
              <GridItem key={`${idx}-3`}>{job.type}</GridItem>
              <GridItem key={`${idx}-4`}>
                {job.createdAt.toLocaleString()}
              </GridItem>
            </Fragment>
          );
        })}
      </ImportJobGrid>
    </ImportJobsContainer>
  );
};
