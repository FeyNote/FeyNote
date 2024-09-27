import { IonContent, IonPage, useIonToast } from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { GraphRenderer } from './GraphRenderer';
import { trpc } from '../../utils/trpc';
import { handleTRPCErrors } from '../../utils/handleTRPCErrors';
import { useEffect, useState } from 'react';
import type { ArtifactDTO } from '@feynote/prisma/types';
import { NullState } from '../info/NullState';
import { gitNetwork } from 'ionicons/icons';
import { useProgressBar } from '../../utils/useProgressBar';
import styled from 'styled-components';

const StyledNullState = styled(NullState)`
  margin-top: 10vh;
`;

export const Graph: React.FC = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>([]);

  const load = async () => {
    await trpc.artifact.getArtifacts
      .query()
      .then((_artifacts) => {
        setArtifacts(_artifacts);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  useEffect(() => {
    const progress = startProgressBar();
    load().then(() => {
      progress.dismiss();
      setInitialLoadCompleted(true);
    });
  }, []);

  return (
    <IonPage>
      <PaneNav title={t('graph.title')} />
      {ProgressBar}
      <IonContent>
        {initialLoadCompleted && (
          <>
            {artifacts.length ? (
              <GraphRenderer artifacts={artifacts} />
            ) : (
              <StyledNullState
                title={t('graph.nullState.title')}
                message={t('graph.nullState.message')}
                icon={gitNetwork}
              />
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};
