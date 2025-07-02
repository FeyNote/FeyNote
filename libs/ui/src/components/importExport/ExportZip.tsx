import { IonButton, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { trpc } from '../../utils/trpc';
import type { ExportFormat } from '@feynote/prisma/types';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';

const Header = styled.h3`
  margin-top: 0;
`;

const Subtext = styled(IonText)`
  opacity: 0.6;
  padding-bottom: 8px;
  display: block;
`;

interface Props {
  type: 'markdown' | 'json';
}

export const ExportZip: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { navigate } = useContext(PaneContext);
  const instructions = useMemo(() => {
    if (props.type === 'json') {
      return t('export.options.json.instructions');
    } else {
      return t('export.options.markdown.instructions');
    }
  }, [props.type, t]);

  const _export = async (format: 'markdown' | 'json') => {
    await trpc.job.createExportJob.mutate({
      format: format as ExportFormat,
    });
    navigate(PaneableComponent.Export, {}, PaneTransition.Push);
  };

  return (
    <div className="ion-padding">
      <Header>{t('export.download.header')}</Header>
      <Subtext>{instructions}</Subtext>
      <div>
        <IonButton size="small" onClick={() => _export(props.type)}>
          {t('export.title')}
        </IonButton>
      </div>
    </div>
  );
};
