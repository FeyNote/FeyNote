import {
  PaneContentContainer,
  PaneContent,
} from '../pane/PaneContentContainer';
import { getThreadsAction } from '../../actions/getThreadsAction';
import { useEffect, useMemo, useState } from 'react';
import {
  IoChatbubbles,
  IoChevronForward,
  IoExpand,
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
import { useCurrentWorkspaceThreadIds } from '../../utils/workspace/useCurrentWorkspaceThreadIds';
import { AllArtifactsSortOrder } from '../artifact/allArtifacts/AllArtifactsSort';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px;
  container-type: inline-size;
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 32px;

  @container (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const GraphSection = styled.div`
  position: relative;
  height: 280px;
  max-width: 720px;
  margin: 0 auto 32px;
  border-radius: 8px;
  border: 1px solid var(--gray-a4);
  overflow: hidden;
`;

const GraphExpandButton = styled.button`
  all: unset;
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-color-dim);
  background: var(--card-background);
  box-shadow: var(--card-box-shadow);
  z-index: 1;

  &:hover {
    color: var(--text-color);
    background: var(--general-background-hover);
  }
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--gray-a4);
  margin-bottom: 4px;
  color: var(--text-color-dim);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;

  &:hover {
    color: var(--text-color);
  }
`;

const SectionHeaderLabel = styled.span`
  flex: 1;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  margin: 0 -16px;
  font-size: 0.875rem;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 8px;
  transition: background 150ms;

  &:hover {
    background: var(--general-background-hover);
  }
`;

const SectionNullState = styled(NullState)`
  padding-top: 16px;
  padding-bottom: 16px;
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
  const currentWorkspaceThreadIds = useCurrentWorkspaceThreadIds();
  const filteredThreads = useMemo(() => {
    if (!recentlyUpdatedThreads) return undefined;
    if (!currentWorkspaceThreadIds) return recentlyUpdatedThreads;
    return recentlyUpdatedThreads.filter((thread) =>
      currentWorkspaceThreadIds.has(thread.id),
    );
  }, [recentlyUpdatedThreads, currentWorkspaceThreadIds]);
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
          <Container>
            {artifactSnapshots?.length ? (
              <GraphSection>
                <GraphExpandButton
                  onClick={(event) =>
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.Graph,
                      { workspaceId: props.workspaceId },
                    )
                  }
                >
                  <IoExpand size={16} />
                </GraphExpandButton>
                <GraphRenderer
                  artifacts={graphArtifacts}
                  edges={edges}
                  enableInitialZoom={true}
                />
              </GraphSection>
            ) : null}

            <SectionsGrid>
              <Section>
                <SectionHeader
                  onClick={(event) =>
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.AllArtifacts,
                      {
                        workspaceId: props.workspaceId,
                        initialSortOrder: AllArtifactsSortOrder.UpdatedAtDesc,
                      },
                    )
                  }
                >
                  <LuTelescope size={14} />
                  <SectionHeaderLabel>
                    {t('dashboard.recents.title')}
                  </SectionHeaderLabel>
                  <IoChevronForward size={12} />
                </SectionHeader>
                {recentArtifacts.map((recentArtifact) => (
                  <Item
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
                  </Item>
                ))}
                {!recentArtifacts.length && (
                  <SectionNullState
                    size="small"
                    title={t('dashboard.noRecentArtifacts.title')}
                    message={t('dashboard.noRecentArtifacts.message')}
                  />
                )}
              </Section>

              {filteredThreads && (
                <Section>
                  <SectionHeader
                    onClick={(event) =>
                      navigateWithKeyboardHandler(
                        event,
                        PaneableComponent.AIThreadsList,
                        {},
                      )
                    }
                  >
                    <IoChatbubbles size={14} />
                    <SectionHeaderLabel>
                      {t('dashboard.aiThreads.title')}
                    </SectionHeaderLabel>
                    <IoChevronForward size={12} />
                  </SectionHeader>
                  {filteredThreads.map((recentThread) => (
                    <Item
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
                    </Item>
                  ))}
                  {!filteredThreads.length && (
                    <SectionNullState
                      size="small"
                      title={t('dashboard.noRecentThreads.title')}
                      message={t('dashboard.noRecentThreads.message')}
                    />
                  )}
                </Section>
              )}

              {!!incomingSharedArtifacts.length && (
                <Section>
                  <SectionHeader
                    onClick={(event) =>
                      navigateWithKeyboardHandler(
                        event,
                        PaneableComponent.SharedContent,
                        {},
                      )
                    }
                  >
                    <LuUsers size={14} />
                    <SectionHeaderLabel>
                      {t('dashboard.sharedContent.title')}
                    </SectionHeaderLabel>
                    <IoChevronForward size={12} />
                  </SectionHeader>
                  {incomingSharedArtifacts.map((sharedArtifact) => (
                    <Item
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
                    </Item>
                  ))}
                </Section>
              )}
            </SectionsGrid>
          </Container>
        )}
      </PaneContent>
    </PaneContentContainer>
  );
};
