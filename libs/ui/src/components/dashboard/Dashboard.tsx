import { Card, IconButton } from '@radix-ui/themes';
import {
  PaneContentContainer,
  PaneContent,
} from '../pane/PaneContentContainer';
import { getThreadsAction } from '../../actions/getThreadsAction';
import { useEffect, useMemo, useState } from 'react';
import {
  IoChatbubbles,
  IoExpand,
  IoGitNetwork,
  LuTelescope,
  LuUsers,
} from '../AppIcons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { NullState } from '../info/NullState';
import { PaneNav } from '../pane/PaneNav';
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
  gap: 16px;
  padding: 16px;
`;

const DashboardCard = styled(Card)`
  width: 350px;
  max-height: 400px;
  padding: 8px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color-dim);
`;

const CardHeaderLabel = styled.span`
  flex: 1;
`;

const CardItem = styled.div`
  display: flex;
  align-items: center;
  min-height: 34px;
  font-size: 0.875rem;
  padding: 6px 8px;
  color: var(--text-color);
  border-radius: var(--card-border-radius);
  cursor: pointer;

  &:hover {
    background: var(--contrasting-element-background-hover);
  }
`;

const CardNullState = styled(NullState)`
  padding-top: 24px;
  padding-bottom: 24px;
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
            <DashboardCard>
              <CardHeader>
                <LuTelescope />
                <CardHeaderLabel>
                  {t('dashboard.recents.title')}
                </CardHeaderLabel>
                <IconButton
                  style={{ margin: '0' }}
                  variant="ghost"
                  size="1"
                  onClick={(event) =>
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.RecentArtifacts,
                      {},
                    )
                  }
                >
                  <IoExpand size={18} />
                </IconButton>
              </CardHeader>
              {recentArtifacts.map((recentArtifact) => (
                <CardItem
                  key={recentArtifact.id}
                  onClick={(event) =>
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.Artifact,
                      { id: recentArtifact.id },
                    )
                  }
                >
                  {recentArtifact.meta.title}
                </CardItem>
              ))}
              {!recentArtifacts.length && (
                <CardNullState
                  size="small"
                  title={t('dashboard.noRecentArtifacts.title')}
                  message={t('dashboard.noRecentArtifacts.message')}
                />
              )}
            </DashboardCard>
            <DashboardCard>
              <CardHeader>
                <IoGitNetwork />
                <CardHeaderLabel>{t('dashboard.graph.title')}</CardHeaderLabel>
                <IconButton
                  style={{ margin: '0' }}
                  variant="ghost"
                  size="1"
                  onClick={(event) =>
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.Graph,
                      { workspaceId: props.workspaceId },
                    )
                  }
                >
                  <IoExpand size={18} />
                </IconButton>
              </CardHeader>
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
            </DashboardCard>
            {recentlyUpdatedThreads && (
              <DashboardCard>
                <CardHeader>
                  <IoChatbubbles />
                  <CardHeaderLabel>
                    {t('dashboard.aiThreads.title')}
                  </CardHeaderLabel>
                  <IconButton
                    style={{ margin: '0' }}
                    variant="ghost"
                    size="1"
                    onClick={(event) =>
                      navigateWithKeyboardHandler(
                        event,
                        PaneableComponent.AIThreadsList,
                        {},
                      )
                    }
                  >
                    <IoExpand size={18} />
                  </IconButton>
                </CardHeader>
                {recentlyUpdatedThreads.map((recentThread) => (
                  <CardItem
                    key={recentThread.id}
                    onClick={(event) =>
                      navigateWithKeyboardHandler(
                        event,
                        PaneableComponent.AIThread,
                        { id: recentThread.id },
                      )
                    }
                  >
                    {recentThread.title || t('generic.untitled')}
                  </CardItem>
                ))}
                {!recentlyUpdatedThreads.length && (
                  <CardNullState
                    size="small"
                    title={t('dashboard.noRecentThreads.title')}
                    message={t('dashboard.noRecentThreads.message')}
                  />
                )}
              </DashboardCard>
            )}
            <DashboardCard>
              <CardHeader>
                <LuUsers />
                <CardHeaderLabel>
                  {t('dashboard.sharedContent.title')}
                </CardHeaderLabel>
                <IconButton
                  style={{ margin: '0' }}
                  variant="ghost"
                  size="1"
                  onClick={(event) =>
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.SharedContent,
                      {},
                    )
                  }
                >
                  <IoExpand size={18} />
                </IconButton>
              </CardHeader>
              {incomingSharedArtifacts.map((sharedArtifact) => (
                <CardItem
                  key={sharedArtifact.id}
                  onClick={(event) =>
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.Artifact,
                      { id: sharedArtifact.id },
                    )
                  }
                >
                  {sharedArtifact.meta.title}
                </CardItem>
              ))}
              {!incomingSharedArtifacts.length && (
                <CardNullState
                  size="small"
                  title={t('dashboard.noSharedContent.title')}
                  message={t('dashboard.noSharedContent.message')}
                />
              )}
            </DashboardCard>
          </FlexContainer>
        )}
      </PaneContent>
    </PaneContentContainer>
  );
};
