import {
  IonCard,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonPage,
  useIonToast,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  documentText,
  gitNetwork,
  pin,
  pricetag,
  telescope,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { ArtifactDTO } from '@feynote/prisma/types';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { useProgressBar } from '../../../utils/useProgressBar';
import { PaneNav } from '../pane/PaneNav';
import { PaneContext } from '../../context/pane/PaneContext';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { DashboardRightSideMenu } from './DashboardSideMenu';
import { createPortal } from 'react-dom';
import { CompactIonItem } from '../CompactIonItem';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';

const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const CardTitle = styled(IonCardTitle)`
  padding: 8px;
  display: flex;
  align-items: center;
`;

const Card = styled(IonCard)`
  width: 300px;
  padding: 8px;
`;

const CardNullState = styled(NullState)`
  padding-top: 24px;
`;

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { navigate, isPaneFocused } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);
  const [presentToast] = useIonToast();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>([]);
  const pinnedArtifacts = useMemo(
    () => artifacts.filter((artifact) => artifact.isPinned),
    [artifacts],
  );
  const recentArtifacts = useMemo(
    () =>
      artifacts
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
    [artifacts],
  );

  const getUserArtifacts = () => {
    const progress = startProgressBar();
    trpc.artifact.getArtifacts
      .query({})
      .then((_artifacts) => {
        setArtifacts(_artifacts);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        progress.dismiss();
      });
  };

  useEffect(() => {
    getUserArtifacts();
  }, []);

  return (
    <IonPage>
      <PaneNav title={t('dashboard.title')} />
      <IonContent>
        {ProgressBar}
        <FlexContainer>
          <Card>
            <CardTitle>
              <IonIcon icon={pin} />
              &nbsp;{t('dashboard.pinned.title')}
            </CardTitle>
            {pinnedArtifacts.map((pinnedArtifact) => (
              <CompactIonItem
                lines="none"
                key={pinnedArtifact.id}
                onClick={(event) =>
                  navigate(
                    PaneableComponent.Artifact,
                    { id: pinnedArtifact.id },
                    event.metaKey || event.ctrlKey
                      ? PaneTransition.NewTab
                      : PaneTransition.Push,
                    !(event.metaKey || event.ctrlKey),
                  )
                }
                button
              >
                {pinnedArtifact.title}
              </CompactIonItem>
            ))}
            {!pinnedArtifacts.length && (
              <CardNullState
                title={t('dashboard.noPinned.title')}
                message={t('dashboard.noPinned.message')}
                icon={documentText}
              />
            )}
          </Card>
          <Card>
            <CardTitle>
              <IonIcon icon={telescope} />
              &nbsp;{t('dashboard.recents.title')}
            </CardTitle>
            {recentArtifacts.map((recentArtifact) => (
              <CompactIonItem
                lines="none"
                key={recentArtifact.id}
                onClick={(event) =>
                  navigate(
                    PaneableComponent.Artifact,
                    { id: recentArtifact.id },
                    event.metaKey || event.ctrlKey
                      ? PaneTransition.NewTab
                      : PaneTransition.Push,
                    !(event.metaKey || event.ctrlKey),
                  )
                }
                button
              >
                {recentArtifact.title}
              </CompactIonItem>
            ))}
            {!recentArtifacts.length && (
              <CardNullState
                title={t('dashboard.noRecents.title')}
                message={t('dashboard.noRecents.message')}
                icon={documentText}
              />
            )}
          </Card>
          <Card>
            <CardTitle>
              <IonIcon icon={gitNetwork} />
              &nbsp;{t('dashboard.graph.title')}
            </CardTitle>
            [ Graph view here ]
          </Card>
          <Card>
            <CardTitle>
              <IonIcon icon={pricetag} />
              &nbsp;{t('dashboard.tags.title')}
            </CardTitle>
            [ Tag list here ]
          </Card>
        </FlexContainer>
      </IonContent>
      {isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(
          <DashboardRightSideMenu artifacts={artifacts} />,
          sidemenuContentRef.current,
        )}
    </IonPage>
  );
};
