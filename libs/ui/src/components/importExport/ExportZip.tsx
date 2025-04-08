import { IonButton, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import styled from 'styled-components';
import { trpc } from '../../utils/trpc';
import { ExportJobType } from '@feynote/prisma/types';

const Header = styled.h3`
  margin-top: 0;
`;

const Subtext = styled(IonText)`
  opacity: 0.6;
  padding-bottom: 8px;
  display: block;
`;

interface Props {
  type: ExportJobType;
  fetchJobs: () => void;
}

export const ExportZip: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const instructions = useMemo(() => {
    if (props.type === ExportJobType.Json) {
      return t('importExport.download.json.subtext');
    } else {
      return t('importExport.download.markdown.subtext');
    }
  }, [props.type, t]);

  const _export = async (type: ExportJobType) => {
    const jobId = await trpc.job.createExportJob.mutate({ type });
    await trpc.job.startJob.mutate({ id: jobId });
  };

  return (
    <div className="ion-padding">
      <Header>{t('importExport.download.header')}</Header>
      <Subtext>{instructions}</Subtext>
      <div>
        <IonButton size="small" onClick={() => _export(props.type)}>
          {t('importExport.export')}
        </IonButton>
      </div>
    </div>
  );
};
