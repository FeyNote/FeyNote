import {
  IonBadge,
  IonButton,
  IonCard,
  IonIcon,
  IonLabel,
  IonList,
  IonListHeader,
} from '@ionic/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import styled from 'styled-components';
import { EventName } from '../../context/events/EventName';
import {
  ImmediateDebouncer,
  PreferenceNames,
  type ThreadDTO,
} from '@feynote/shared-utils';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import {
  gitNetwork,
  home,
  search,
  settings,
  add,
  expand,
  heart,
  list,
} from 'ionicons/icons';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useGlobalSearchContext } from '../../context/globalSearch/GlobalSearchContext';
import { CompactIonItem } from '../CompactIonItem';
import { NowrapIonLabel } from '../NowrapIonLabel';
import { ArtifactTree } from '../artifact/ArtifactTree';
import { eventManager } from '../../context/events/EventManager';
import { InfoButton } from '../info/InfoButton';
import { AppConnectionStatus } from './AppConnectionStatus';
import { IoChatbubbles, CiInboxIn, LuFolderTree } from '../AppIcons';
import { useGlobalPaneContext } from '../../context/globalPane/GlobalPaneContext';
import { AIThreadContextMenu } from '../assistant/AIThreadContextMenu';
import { SideMenuItemContextMenu } from './SideMenuItemContextMenu';
import { WorkspaceSelector } from '../workspace/WorkspaceSelector';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { useCurrentWorkspaceThreadIds } from '../../utils/workspace/useCurrentWorkspaceThreadIds';
import { useInboxArtifactSnapshots } from '../../utils/artifactTree/useInboxArtifactSnapshots';
import { useInboxWorkspaceSnapshots } from '../../utils/workspace/useInboxWorkspaceSnapshots';

const SidebarCard = styled(IonCard)`
  margin-bottom: 0;
`;

const TreeCard = styled(SidebarCard)`
  display: grid;
  grid-template-rows: min-content auto;
`;

const ShowMoreButtonText = styled.span`
  font-size: 0.75rem;
`;

const Container = styled.div<{
  $isTreeCardShowing: boolean;
  $isThreadsShowing: boolean;
}>`
  height: 100vh;
  display: grid;
  grid-template-rows: min-content min-content ${(props) =>
      props.$isTreeCardShowing ? `auto` : ``} ${(props) =>
      props.$isThreadsShowing ? `min-content` : ``} min-content ${(props) =>
      props.$isTreeCardShowing ? `` : `auto`} min-content;
  padding-bottom: 10px;
`;

const ConnectionStatusContainer = styled.div`
  margin-top: 8px;
`;

/**
 * The globally unique tree id for react complex tree
 */
const TREE_ID = 'leftSideMenuArtifactTree';

/**
 * The default number of recent artifacts to show
 */
const RECENT_ARTIFACTS_LIMIT_DEFAULT = 5;
/**
 * How many more recent threads to show when "more" is clicked
 */
const RECENT_THREADS_LIMIT_INC = 10;
/**
 * Reload debounce interval in ms
 */
const RELOAD_DEBOUNCE_INTERVAL = 5000;

export const LeftSideMenu: React.FC = () => {
  const { t } = useTranslation();
  const { currentWorkspaceId } = useCurrentWorkspaceId();

  const { getPreference } = usePreferencesContext();
  const { getPaneById } = useGlobalPaneContext();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();
  const { trigger: triggerGlobalSearch } = useGlobalSearchContext();
  const currentPane = getPaneById(undefined);
  const [recentlyUpdatedThreads, setRecentlyUpdatedThreads] = useState<
    ThreadDTO[]
  >([]);
  const [recentlyUpdatedThreadsLimit, setRecentlyUpdatedThreadsLimit] =
    useState(RECENT_ARTIFACTS_LIMIT_DEFAULT);
  const { inboxArtifactSnapshots } = useInboxArtifactSnapshots();
  const { inboxWorkspaceSnapshots } = useInboxWorkspaceSnapshots();
  const inboxCount =
    inboxArtifactSnapshots.length + inboxWorkspaceSnapshots.length;

  const showMoreThreads = () => {
    setRecentlyUpdatedThreadsLimit(
      recentlyUpdatedThreadsLimit + RECENT_THREADS_LIMIT_INC,
    );
  };

  const load = () => {
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
        // Do nothing
      });
  };

  const loadDebouncerRef = useRef(
    new ImmediateDebouncer(
      () => {
        load();
      },
      RELOAD_DEBOUNCE_INTERVAL,
      {
        enableFollowupCall: false,
      },
    ),
  );

  useEffect(() => {
    loadDebouncerRef.current.call();
  }, [currentPane.currentView.navigationEventId]);

  useEffect(() => {
    const handler = () => {
      loadDebouncerRef.current.call();
    };

    eventManager.addEventListener([EventName.ArtifactUpdated], handler);

    return () => {
      eventManager.removeEventListener([EventName.ArtifactUpdated], handler);
    };
  }, []);

  const currentWorkspaceThreadIds = useCurrentWorkspaceThreadIds();

  const filteredThreads = useMemo(() => {
    if (!currentWorkspaceThreadIds) return recentlyUpdatedThreads;
    return recentlyUpdatedThreads.filter((thread) =>
      currentWorkspaceThreadIds.has(thread.id),
    );
  }, [recentlyUpdatedThreads, currentWorkspaceThreadIds]);

  const showTreeCard = getPreference(PreferenceNames.LeftPaneShowArtifactTree);
  const showThreadsCard =
    !!filteredThreads.length &&
    getPreference(PreferenceNames.LeftPaneShowRecentThreads);

  return (
    <Container
      $isTreeCardShowing={showTreeCard}
      $isThreadsShowing={showThreadsCard}
    >
      <SidebarCard>
        <WorkspaceSelector />
      </SidebarCard>

      <SidebarCard>
        <SideMenuItemContextMenu
          component={PaneableComponent.PersistentSearch}
          componentProps={{ workspaceId: currentWorkspaceId }}
          paneId={currentPane.id}
        >
          <CompactIonItem
            lines="none"
            onClick={() => triggerGlobalSearch()}
            button
          >
            <IonIcon icon={search} size="small" />
            &nbsp;&nbsp;
            <IonLabel>
              {t(currentWorkspaceId ? 'menu.search.workspace' : 'menu.search')}
            </IonLabel>
          </CompactIonItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.Dashboard}
          componentProps={{ workspaceId: currentWorkspaceId }}
          paneId={currentPane.id}
        >
          <CompactIonItem
            lines="none"
            onClick={(event) =>
              navigateWithKeyboardHandler(event, PaneableComponent.Dashboard, {
                workspaceId: currentWorkspaceId,
              })
            }
            button
          >
            <IonIcon icon={home} size="small" />
            &nbsp;&nbsp;
            <IonLabel>
              {t(
                currentWorkspaceId
                  ? 'menu.dashboard.workspace'
                  : 'menu.dashboard',
              )}
            </IonLabel>
          </CompactIonItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.AllArtifacts}
          componentProps={{ workspaceId: currentWorkspaceId }}
          paneId={currentPane.id}
        >
          <CompactIonItem
            lines="none"
            onClick={(event) =>
              navigateWithKeyboardHandler(
                event,
                PaneableComponent.AllArtifacts,
                { workspaceId: currentWorkspaceId },
              )
            }
            button
          >
            <IonIcon icon={list} size="small" />
            &nbsp;&nbsp;
            <IonLabel>
              {t(
                currentWorkspaceId
                  ? 'menu.allArtifacts.workspace'
                  : 'menu.allArtifacts',
              )}
            </IonLabel>
          </CompactIonItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.Graph}
          componentProps={{ workspaceId: currentWorkspaceId }}
          paneId={currentPane.id}
        >
          <CompactIonItem
            lines="none"
            onClick={(event) =>
              navigateWithKeyboardHandler(event, PaneableComponent.Graph, {
                workspaceId: currentWorkspaceId,
              })
            }
            button
          >
            <IonIcon icon={gitNetwork} size="small" />
            &nbsp;&nbsp;
            <IonLabel>
              {t(currentWorkspaceId ? 'menu.graph.workspace' : 'menu.graph')}
            </IonLabel>
          </CompactIonItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.Inbox}
          componentProps={{}}
          paneId={currentPane.id}
        >
          <CompactIonItem
            lines="none"
            onClick={(event) =>
              navigateWithKeyboardHandler(event, PaneableComponent.Inbox, {})
            }
            button
          >
            <CiInboxIn size={18} />
            &nbsp;&nbsp;
            <IonLabel>{t('inbox.title')}</IonLabel>
            {!!inboxCount && <IonBadge slot="end">{inboxCount}</IonBadge>}
          </CompactIonItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.CreateNew}
          componentProps={{}}
          paneId={currentPane.id}
        >
          <CompactIonItem
            lines="none"
            onClick={(event) =>
              navigateWithKeyboardHandler(
                event,
                PaneableComponent.CreateNew,
                {},
              )
            }
            button
          >
            <IonIcon icon={add} size="small" />
            &nbsp;&nbsp;
            <IonLabel>{t('menu.new')}</IonLabel>
          </CompactIonItem>
        </SideMenuItemContextMenu>
      </SidebarCard>

      {showTreeCard && (
        <TreeCard>
          <IonList class="ion-no-padding">
            <IonListHeader lines="full">
              <LuFolderTree color="rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54)" />
              &nbsp;&nbsp;
              <IonLabel>
                {t(currentWorkspaceId ? 'menu.tree.workspace' : 'menu.tree')}
              </IonLabel>
              <InfoButton
                message={t('menu.tree.help')}
                docsLink="https://docs.feynote.com/documents/tree/#organizing-documents"
              />
              <IonButton
                onClick={(event) =>
                  navigateWithKeyboardHandler(
                    event,
                    PaneableComponent.ArtifactTreeFullpage,
                    { workspaceId: currentWorkspaceId },
                  )
                }
                size="small"
                fill="clear"
              >
                <IonIcon icon={expand} size="small" />
              </IonButton>
            </IonListHeader>
          </IonList>
          <ArtifactTree
            treeId={TREE_ID}
            registerAsGlobalTreeDragHandler={true}
            editable={true}
            mode="navigate"
            enableItemContextMenu={true}
            enableOpenItemMemory={true}
          />
        </TreeCard>
      )}

      {showThreadsCard && (
        <SidebarCard>
          <IonList class="ion-no-padding">
            <IonListHeader lines="full">
              <IoChatbubbles />
              &nbsp;&nbsp;
              <IonLabel>{t('menu.recentlyUpdatedThreads')}</IonLabel>
              <IonButton
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
              </IonButton>
            </IonListHeader>
            {filteredThreads
              .slice(0, recentlyUpdatedThreadsLimit)
              .map((recentlyUpdatedThread) => (
                <AIThreadContextMenu
                  key={recentlyUpdatedThread.id}
                  id={recentlyUpdatedThread.id}
                  title={recentlyUpdatedThread.title || t('generic.untitled')}
                  paneId={currentPane.id}
                  onDelete={load}
                  onTitleChange={() => load()}
                >
                  <CompactIonItem
                    lines="none"
                    onClick={(event) =>
                      navigateWithKeyboardHandler(
                        event,
                        PaneableComponent.AIThread,
                        { id: recentlyUpdatedThread.id },
                      )
                    }
                    button
                  >
                    <NowrapIonLabel>
                      {recentlyUpdatedThread.title || t('generic.untitled')}
                    </NowrapIonLabel>
                  </CompactIonItem>
                </AIThreadContextMenu>
              ))}
            {filteredThreads.length > recentlyUpdatedThreadsLimit && (
              <IonButton
                onClick={showMoreThreads}
                fill="clear"
                size="small"
                expand="full"
              >
                <ShowMoreButtonText>{t('menu.more')}</ShowMoreButtonText>
              </IonButton>
            )}
          </IonList>
        </SidebarCard>
      )}

      <SidebarCard>
        <SideMenuItemContextMenu
          component={PaneableComponent.Contribute}
          componentProps={{}}
          paneId={currentPane.id}
        >
          <CompactIonItem
            lines="none"
            onClick={(event) =>
              navigateWithKeyboardHandler(
                event,
                PaneableComponent.Contribute,
                {},
              )
            }
            button
          >
            <IonIcon icon={heart} size="small" />
            &nbsp;&nbsp;
            <IonLabel>{t('menu.contribute')}</IonLabel>
          </CompactIonItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.Settings}
          componentProps={{}}
          paneId={currentPane.id}
        >
          <CompactIonItem
            lines="none"
            onClick={(event) =>
              navigateWithKeyboardHandler(event, PaneableComponent.Settings, {})
            }
            button
          >
            <IonIcon icon={settings} size="small" />
            &nbsp;&nbsp;
            <IonLabel>{t('menu.settings')}</IonLabel>
          </CompactIonItem>
        </SideMenuItemContextMenu>
      </SidebarCard>

      {!showTreeCard && <div></div>}

      <ConnectionStatusContainer>
        <AppConnectionStatus />
      </ConnectionStatusContainer>
    </Container>
  );
};
