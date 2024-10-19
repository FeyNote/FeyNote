import {
  IonButton,
  IonCard,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonPage,
  useIonToast,
} from '@ionic/react';
import { trpc } from '../../utils/trpc';
import { handleTRPCErrors } from '../../utils/handleTRPCErrors';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  chatboxEllipses,
  expand,
  gitNetwork,
  people,
  pin,
  telescope,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import type { ArtifactDTO, ThreadDTO } from '@feynote/global-types';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { useProgressBar } from '../../utils/useProgressBar';
import { PaneNav } from '../pane/PaneNav';
import { PaneContext } from '../../context/pane/PaneContext';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { DashboardRightSideMenu } from './DashboardRightSideMenu';
import { createPortal } from 'react-dom';
import { CompactIonItem } from '../CompactIonItem';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { GraphRenderer } from '../graph/GraphRenderer';
import { SessionContext } from '../../context/session/SessionContext';

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
  width: 350px;
  max-height: 400px;
  padding: 8px;
`;

const CardNullState = styled(NullState)`
  padding-top: 24px;
  padding-bottom: 24px;
`;

const CardTitleButton = styled(IonButton)`
  margin-left: auto;
`;

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { navigate, isPaneFocused } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [presentToast] = useIonToast();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const { session } = useContext(SessionContext);
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>([]);
  const pinnedArtifacts = useMemo(
    () => artifacts.filter((artifact) => artifact.isPinned),
    [artifacts],
  );
  const recentArtifacts = useMemo(
    () =>
      artifacts
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 10),
    [artifacts],
  );
  const incomingSharedArtifacts = useMemo(
    () =>
      artifacts
        .filter((artifact) => artifact.userId !== session.userId)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 10),
    [artifacts],
  );
  const [recentlyUpdatedThreads, setRecentlyUpdatedThreads] = useState<
    ThreadDTO[]
  >([]);

  const getUserArtifacts = async () => {
    await trpc.artifact.getArtifacts
      .query()
      .then((_artifacts) => {
        setArtifacts(_artifacts);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  const getUserThreads = async () => {
    trpc.ai.getThreads
      .query()
      .then((threads) => {
        setRecentlyUpdatedThreads(
          threads.sort(
            (a, b) =>
              (b.messages.at(-1)?.createdAt.getTime() || 0) -
              (a.messages.at(-1)?.createdAt.getTime() || 0),
          ),
        );
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  const loadWithProgress = async () => {
    const progress = startProgressBar();
    await Promise.allSettled([getUserArtifacts(), getUserThreads()]);
    progress.dismiss();
  };

  useEffect(() => {
    loadWithProgress().then(() => {
      setInitialLoadComplete(true);
    });
  }, []);

  return (
    <IonPage>
      <PaneNav title={t('dashboard.title')} />
      <IonContent>
        {ProgressBar}
        {initialLoadComplete && (
          <FlexContainer>
            <Card>
              <CardTitle>
                <IonIcon icon={pin} />
                &nbsp;{t('dashboard.pinned.title')}
                <CardTitleButton
                  onClick={(event) =>
                    navigate(
                      PaneableComponent.PinnedArtifacts,
                      {},
                      event.metaKey || event.ctrlKey
                        ? PaneTransition.NewTab
                        : PaneTransition.Push,
                      !(event.metaKey || event.ctrlKey),
                    )
                  }
                  size="small"
                  fill="clear"
                >
                  <IonIcon icon={expand} size="small" />
                </CardTitleButton>
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
                  size="small"
                  title={t('dashboard.noPinnedArtifacts.title')}
                  message={t('dashboard.noPinnedArtifacts.message')}
                />
              )}
            </Card>
            <Card>
              <CardTitle>
                <IonIcon icon={telescope} />
                &nbsp;{t('dashboard.recents.title')}
                <CardTitleButton
                  onClick={(event) =>
                    navigate(
                      PaneableComponent.RecentArtifacts,
                      {},
                      event.metaKey || event.ctrlKey
                        ? PaneTransition.NewTab
                        : PaneTransition.Push,
                      !(event.metaKey || event.ctrlKey),
                    )
                  }
                  size="small"
                  fill="clear"
                >
                  <IonIcon icon={expand} size="small" />
                </CardTitleButton>
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
                  size="small"
                  title={t('dashboard.noRecentArtifacts.title')}
                  message={t('dashboard.noRecentArtifacts.message')}
                />
              )}
            </Card>
            <Card>
              <CardTitle>
                <IonIcon icon={gitNetwork} />
                &nbsp;{t('dashboard.graph.title')}
                <CardTitleButton
                  onClick={(event) =>
                    navigate(
                      PaneableComponent.Graph,
                      {},
                      event.metaKey || event.ctrlKey
                        ? PaneTransition.NewTab
                        : PaneTransition.Push,
                      !(event.metaKey || event.ctrlKey),
                    )
                  }
                  size="small"
                  fill="clear"
                >
                  <IonIcon icon={expand} size="small" />
                </CardTitleButton>
              </CardTitle>
              {artifacts.length ? (
                <GraphRenderer artifacts={artifacts} />
              ) : (
                <CardNullState
                  size="small"
                  title={t('dashboard.noGraph.title')}
                  message={t('dashboard.noGraph.message')}
                />
              )}
            </Card>
            {
              // <Card>
              //   <CardTitle>
              //     <IonIcon icon={pricetag} />
              //     &nbsp;{t('dashboard.tags.title')}
              //   </CardTitle>
              //   [Coming soon!]
              // </Card>
            }
            <Card>
              <CardTitle>
                <IonIcon icon={chatboxEllipses} />
                &nbsp;{t('dashboard.aiThreads.title')}
                <CardTitleButton
                  onClick={(event) =>
                    navigate(
                      PaneableComponent.AIThreadsList,
                      {},
                      event.metaKey || event.ctrlKey
                        ? PaneTransition.NewTab
                        : PaneTransition.Push,
                      !(event.metaKey || event.ctrlKey),
                    )
                  }
                  size="small"
                  fill="clear"
                >
                  <IonIcon icon={expand} size="small" />
                </CardTitleButton>
              </CardTitle>
              {recentlyUpdatedThreads.map((recentThread) => (
                <CompactIonItem
                  lines="none"
                  key={recentThread.id}
                  onClick={(event) =>
                    navigate(
                      PaneableComponent.AIThread,
                      { id: recentThread.id },
                      event.metaKey || event.ctrlKey
                        ? PaneTransition.NewTab
                        : PaneTransition.Push,
                      !(event.metaKey || event.ctrlKey),
                    )
                  }
                  button
                >
                  {recentThread.title || t('generic.untitled')}
                </CompactIonItem>
              ))}
              {!recentlyUpdatedThreads.length && (
                <CardNullState
                  size="small"
                  title={t('dashboard.noRecentThreads.title')}
                  message={t('dashboard.noRecentThreads.message')}
                />
              )}
            </Card>
            <Card>
              <CardTitle>
                <IonIcon icon={people} />
                &nbsp;{t('dashboard.sharedContent.title')}
                <CardTitleButton
                  onClick={(event) =>
                    navigate(
                      PaneableComponent.SharedContent,
                      {},
                      event.metaKey || event.ctrlKey
                        ? PaneTransition.NewTab
                        : PaneTransition.Push,
                      !(event.metaKey || event.ctrlKey),
                    )
                  }
                  size="small"
                  fill="clear"
                >
                  <IonIcon icon={expand} size="small" />
                </CardTitleButton>
              </CardTitle>
              {incomingSharedArtifacts.map((sharedArtifact) => (
                <CompactIonItem
                  lines="none"
                  key={sharedArtifact.id}
                  onClick={(event) =>
                    navigate(
                      PaneableComponent.Artifact,
                      { id: sharedArtifact.id },
                      event.metaKey || event.ctrlKey
                        ? PaneTransition.NewTab
                        : PaneTransition.Push,
                      !(event.metaKey || event.ctrlKey),
                    )
                  }
                  button
                >
                  {sharedArtifact.title}
                </CompactIonItem>
              ))}
              {!incomingSharedArtifacts.length && (
                <CardNullState
                  size="small"
                  title={t('dashboard.noSharedContent.title')}
                  message={t('dashboard.noSharedContent.message')}
                />
              )}
            </Card>
          </FlexContainer>
        )}
      </IonContent>
      {isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(
          <DashboardRightSideMenu
            artifacts={artifacts}
            reload={loadWithProgress}
          />,
          sidemenuContentRef.current,
        )}
    </IonPage>
  );
};
