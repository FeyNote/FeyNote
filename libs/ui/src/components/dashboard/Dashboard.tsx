import {
  IonButton,
  IonCard,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonPage,
} from '@ionic/react';
import { trpc } from '../../utils/trpc';
import { useEffect, useMemo, useState } from 'react';
import {
  chatboxEllipses,
  expand,
  gitNetwork,
  people,
  telescope,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { useIndeterminateProgressBar } from '../../utils/useProgressBar';
import { PaneNav } from '../pane/PaneNav';
import { usePaneContext } from '../../context/pane/PaneContext';
import { CompactIonItem } from '../CompactIonItem';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { GraphRenderer } from '../graph/GraphRenderer';
import { useSessionContext } from '../../context/session/SessionContext';
import { type ThreadDTO } from '@feynote/shared-utils';
import { type Edge } from '@feynote/shared-utils';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useEdges } from '../../utils/localDb/edges/useEdges';

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
  const { navigate } = usePaneContext();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const { session } = useSessionContext();
  const { artifactSnapshots } = useArtifactSnapshots();
  const { getEdgesForArtifactId } = useEdges();
  const recentArtifacts = useMemo(() => {
    if (!artifactSnapshots) return [];

    return artifactSnapshots
      ?.sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10);
  }, [artifactSnapshots]);
  const incomingSharedArtifacts = useMemo(() => {
    if (!artifactSnapshots) return [];

    return artifactSnapshots
      ?.filter((artifact) => artifact.meta.userId !== session.userId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10);
  }, [artifactSnapshots]);
  const graphArtifacts = useMemo(() => {
    if (!artifactSnapshots) return [];

    return artifactSnapshots.map((artifact) => ({
      id: artifact.id,
      title: artifact.meta.title,
    }));
  }, [artifactSnapshots]);

  const [recentlyUpdatedThreads, setRecentlyUpdatedThreads] =
    useState<ThreadDTO[]>();
  const edges = useMemo(() => {
    if (!artifactSnapshots) return [];

    const map = artifactSnapshots.reduce<Map<string, Edge>>((acc, artifact) => {
      const { incomingEdges, outgoingEdges } = getEdgesForArtifactId(
        artifact.id,
      );

      for (const edge of incomingEdges) {
        acc.set(edge.id, edge);
      }
      for (const edge of outgoingEdges) {
        acc.set(edge.id, edge);
      }

      return acc;
    }, new Map());

    return Array.from(map.values());
  }, [artifactSnapshots, getEdgesForArtifactId]);

  const getUserThreads = async () => {
    trpc.ai.getThreads
      .query()
      .then((threads) => {
        setRecentlyUpdatedThreads(
          threads.sort(
            (a, b) =>
              (b.messages.at(-1)?.updatedAt.getTime() || 0) -
              (a.messages.at(-1)?.updatedAt.getTime() || 0),
          ),
        );
      })
      .catch(() => {
        // Do nothing. We want to support offline, so if they don't load they don't load.
      });
  };

  const loadWithProgress = async () => {
    const progress = startProgressBar();
    await Promise.allSettled([getUserThreads()]);
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
                  {recentArtifact.meta.title}
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
              {artifactSnapshots?.length ? (
                <GraphRenderer
                  artifacts={graphArtifacts}
                  edges={edges}
                  enableInitialZoom={true}
                />
              ) : (
                <CardNullState
                  size="small"
                  title={t('dashboard.noGraph.title')}
                  message={t('dashboard.noGraph.message')}
                />
              )}
            </Card>
            {recentlyUpdatedThreads && (
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
            )}
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
                  {sharedArtifact.meta.title}
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
    </IonPage>
  );
};
