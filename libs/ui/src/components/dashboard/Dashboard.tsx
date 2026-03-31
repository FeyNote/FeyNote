import { IonButton, IonCard, IonCardTitle, IonIcon } from '@ionic/react';
import {
  PaneContentContainer,
  PaneContent,
} from '../pane/PaneContentContainer';
import { getThreadsAction } from '../../actions/getThreadsAction';
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
import { PaneNav } from '../pane/PaneNav';
import { CompactIonItem } from '../CompactIonItem';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { GraphRenderer } from '../graph/GraphRenderer';
import { useSessionContext } from '../../context/session/SessionContext';
import { type ThreadDTO } from '@feynote/shared-utils';
import type { FeynoteGraphLink } from '../graph/GraphRenderer';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useArtifactSnapshotsForWorkspaceId } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshotsForWorkspaceId';
import { useEdges } from '../../utils/localDb/edges/useEdges';
import { useWorkspaceSnapshot } from '../../utils/localDb/workspaces/useWorkspaceSnapshot';

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

interface Props {
  workspaceId: string | null;
}

export const Dashboard: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { session } = useSessionContext();
  const { artifactSnapshots: allArtifactSnapshots } = useArtifactSnapshots();
  const { getEdgesForArtifactId } = useEdges();
  const { workspaceSnapshot: selectedWorkspaceSnapshot } = useWorkspaceSnapshot(
    props.workspaceId || undefined,
  );
  const { artifactSnapshotsForWorkspace } = useArtifactSnapshotsForWorkspaceId(
    props.workspaceId || undefined,
  );
  const artifactSnapshots = props.workspaceId
    ? (artifactSnapshotsForWorkspace ?? [])
    : allArtifactSnapshots;
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

    const seen = new Set<string>();
    const links: FeynoteGraphLink[] = [];

    for (const artifact of artifactSnapshots) {
      const { incomingEdges, outgoingEdges } = getEdgesForArtifactId(
        artifact.id,
      );

      for (const edge of [...incomingEdges, ...outgoingEdges]) {
        if (seen.has(edge.id)) continue;
        seen.add(edge.id);
        links.push({
          source: edge.artifactId,
          target: edge.targetArtifactId,
          type: 'reference',
        });
      }
    }

    return links;
  }, [artifactSnapshots, getEdgesForArtifactId]);

  const getUserThreads = async () => {
    getThreadsAction()
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

  useEffect(() => {
    getUserThreads().then(() => {
      setInitialLoadComplete(true);
    });
  }, []);

  return (
    <PaneContentContainer>
      <PaneNav
        title={
          selectedWorkspaceSnapshot
            ? t('dashboard.title.workspaceNamed', {
                name:
                  selectedWorkspaceSnapshot.meta.name ||
                  t('workspace.untitled'),
              })
            : t('dashboard.title')
        }
      />
      <PaneContent>
        {initialLoadComplete && (
          <FlexContainer>
            <Card>
              <CardTitle>
                <IonIcon icon={telescope} />
                &nbsp;{t('dashboard.recents.title')}
                <CardTitleButton
                  onClick={(event) =>
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.RecentArtifacts,
                      {},
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
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.Artifact,
                      { id: recentArtifact.id },
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
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.Graph,
                      { workspaceId: props.workspaceId },
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
                      navigateWithKeyboardHandler(
                        event,
                        PaneableComponent.AIThreadsList,
                        {},
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
                      navigateWithKeyboardHandler(
                        event,
                        PaneableComponent.AIThread,
                        { id: recentThread.id },
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
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.SharedContent,
                      {},
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
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.Artifact,
                      { id: sharedArtifact.id },
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
      </PaneContent>
    </PaneContentContainer>
  );
};
