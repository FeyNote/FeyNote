import {
  IonCard,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
} from '@ionic/react';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useContext, useEffect, useMemo, useState } from 'react';
import { telescope } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { ArtifactDTO } from '@feynote/global-types';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { useIndeterminateProgressBar } from '../../utils/useProgressBar';
import { PaneNav } from '../pane/PaneNav';
import { PaneContext } from '../../context/pane/PaneContext';
import { CompactIonItem } from '../CompactIonItem';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { SessionContext } from '../../context/session/SessionContext';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { createPortal } from 'react-dom';
import { RecentArtifactsRightSideMenu } from './RecentArtifactsRightSideMenu';

const Title = styled(IonCardTitle)`
  padding: 8px;
  display: flex;
  align-items: center;
`;

const Card = styled(IonCard)`
  padding: 8px;
`;

const StyledNullState = styled(NullState)`
  padding-top: 24px;
  padding-bottom: 24px;
`;

export const RecentArtifacts: React.FC = () => {
  const { t } = useTranslation();
  const { navigate, isPaneFocused } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const { session } = useContext(SessionContext);
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>([]);
  const recentArtifacts = useMemo(
    () =>
      artifacts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    [artifacts],
  );
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const getUserArtifacts = async () => {
    await trpc.artifact.getArtifacts
      .query()
      .then((_artifacts) => {
        setArtifacts(_artifacts.filter((artifact) => !artifact.deletedAt));
      })
      .catch((error) => {
        handleTRPCErrors(error);
      });
  };

  const loadWithProgress = async () => {
    const progress = startProgressBar();
    await getUserArtifacts();
    progress.dismiss();
  };

  useEffect(() => {
    loadWithProgress().then(() => {
      setInitialLoadComplete(true);
    });
  }, []);

  return (
    <IonPage>
      <PaneNav title={t('recentArtifacts.title')} />
      <IonContent>
        {ProgressBar}
        {initialLoadComplete && (
          <Card>
            <Title>
              <IonIcon icon={telescope} />
              &nbsp;{t('recentArtifacts.title')}
            </Title>
            {recentArtifacts.map((artifact) => (
              <CompactIonItem
                lines="none"
                key={artifact.id}
                onClick={(event) =>
                  navigate(
                    PaneableComponent.Artifact,
                    { id: artifact.id },
                    event.metaKey || event.ctrlKey
                      ? PaneTransition.NewTab
                      : PaneTransition.Push,
                    !(event.metaKey || event.ctrlKey),
                  )
                }
                button
              >
                <IonLabel>
                  {artifact.title}
                  {session.userId !== artifact.userId && (
                    <p>
                      {t('sharedContent.sharedBy')}{' '}
                      {artifact.user?.name || t('sharedContent.unknownUser')}
                    </p>
                  )}
                </IonLabel>
              </CompactIonItem>
            ))}
            {!recentArtifacts.length && (
              <StyledNullState
                size="small"
                title={t('sharedContent.noArtifacts.title')}
                message={t('sharedContent.noArtifacts.message')}
              />
            )}
          </Card>
        )}
      </IonContent>
      {isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(
          <RecentArtifactsRightSideMenu reload={loadWithProgress} />,
          sidemenuContentRef.current,
        )}
    </IonPage>
  );
};
