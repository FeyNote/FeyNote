import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getThreadsAction } from '../../actions/getThreadsAction';
import { Badge, Button, Flex } from '@radix-ui/themes';
import styled from 'styled-components';
import { EventName } from '../../context/events/EventName';
import {
  ImmediateDebouncer,
  PreferenceNames,
  type ThreadDTO,
} from '@feynote/shared-utils';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useGlobalSearchContext } from '../../context/globalSearch/GlobalSearchContext';
import { ArtifactTree } from '../artifact/ArtifactTree';
import { eventManager } from '../../context/events/EventManager';
import { InfoButton } from '../info/InfoButton';
import { AppConnectionStatus } from './AppConnectionStatus';
import {
  FaHeart,
  FaHome,
  IoAdd,
  IoExpand,
  IoGitNetwork,
  IoSearch,
  IoSettings,
  IoChatbubbles,
  CiInboxIn,
  LuFolderTree,
  LuList,
} from '../AppIcons';
import { useGlobalPaneContext } from '../../context/globalPane/GlobalPaneContext';
import { AIThreadContextMenu } from '../assistant/AIThreadContextMenu';
import { SideMenuItemContextMenu } from './SideMenuItemContextMenu';
import { WorkspaceSelector } from '../workspace/WorkspaceSelector';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { useCurrentWorkspaceThreadIds } from '../../utils/workspace/useCurrentWorkspaceThreadIds';
import { useInboxArtifactSnapshots } from '../../utils/artifactTree/useInboxArtifactSnapshots';
import { useInboxWorkspaceSnapshots } from '../../utils/workspace/useInboxWorkspaceSnapshots';
import { FeynoteCard } from '../card/FeynoteCard';
import { FeynoteCardHeader } from '../card/FeynoteCardHeader';
import { FeynoteCardHeaderLabel } from '../card/FeynoteCardHeaderLabel';
import { FeynoteCardItem } from '../card/FeynoteCardItem';
import { FeynoteCardItemLabel } from '../card/FeynoteCardItemLabel';

const TreeCard = styled(FeynoteCard)`
  display: grid;
  grid-template-rows: min-content auto;
  margin-bottom: 0;
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

const MenuIcon = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 18px;
  color: var(--text-color-dim);
`;

const MenuLabel = styled.span`
  margin-left: 8px;
  flex: 1;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--text-color-dim);
  font-size: 18px;

  &:hover {
    background: var(--gray-a3);
  }
`;

/**
 * The globally unique tree id for react complex tree
 */
const TREE_ID = 'leftSideMenuArtifactTree';

/**
 * The number of recent artifacts to show
 */
const RECENT_ARTIFACTS_LIMIT = 5;
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
  const { inboxArtifactSnapshots } = useInboxArtifactSnapshots();
  const { inboxWorkspaceSnapshots } = useInboxWorkspaceSnapshots();
  const inboxCount =
    inboxArtifactSnapshots.length + inboxWorkspaceSnapshots.length;

  const load = () => {
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
    return eventManager.addEventListener(EventName.ArtifactUpdated, () => {
      loadDebouncerRef.current.call();
    });
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
      <FeynoteCard>
        <WorkspaceSelector />
      </FeynoteCard>

      <FeynoteCard>
        <SideMenuItemContextMenu
          component={PaneableComponent.PersistentSearch}
          componentProps={{ workspaceId: currentWorkspaceId }}
          paneId={currentPane.id}
        >
          <FeynoteCardItem $isButton onClick={() => triggerGlobalSearch()}>
            <MenuIcon>
              <IoSearch />
            </MenuIcon>
            <MenuLabel>
              {t(currentWorkspaceId ? 'menu.search.workspace' : 'menu.search')}
            </MenuLabel>
          </FeynoteCardItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.Dashboard}
          componentProps={{ workspaceId: currentWorkspaceId }}
          paneId={currentPane.id}
        >
          <FeynoteCardItem
            $isButton
            onClick={(event) =>
              navigateWithKeyboardHandler(event, PaneableComponent.Dashboard, {
                workspaceId: currentWorkspaceId,
              })
            }
          >
            <MenuIcon>
              <FaHome />
            </MenuIcon>
            <MenuLabel>
              {t(
                currentWorkspaceId
                  ? 'menu.dashboard.workspace'
                  : 'menu.dashboard',
              )}
            </MenuLabel>
          </FeynoteCardItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.AllArtifacts}
          componentProps={{ workspaceId: currentWorkspaceId }}
          paneId={currentPane.id}
        >
          <FeynoteCardItem
            $isButton
            onClick={(event) =>
              navigateWithKeyboardHandler(
                event,
                PaneableComponent.AllArtifacts,
                { workspaceId: currentWorkspaceId },
              )
            }
          >
            <MenuIcon>
              <LuList />
            </MenuIcon>
            <MenuLabel>
              {t(
                currentWorkspaceId
                  ? 'menu.allArtifacts.workspace'
                  : 'menu.allArtifacts',
              )}
            </MenuLabel>
          </FeynoteCardItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.Graph}
          componentProps={{ workspaceId: currentWorkspaceId }}
          paneId={currentPane.id}
        >
          <FeynoteCardItem
            $isButton
            onClick={(event) =>
              navigateWithKeyboardHandler(event, PaneableComponent.Graph, {
                workspaceId: currentWorkspaceId,
              })
            }
          >
            <MenuIcon>
              <IoGitNetwork />
            </MenuIcon>
            <MenuLabel>
              {t(currentWorkspaceId ? 'menu.graph.workspace' : 'menu.graph')}
            </MenuLabel>
          </FeynoteCardItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.Inbox}
          componentProps={{}}
          paneId={currentPane.id}
        >
          <FeynoteCardItem
            $isButton
            onClick={(event) =>
              navigateWithKeyboardHandler(event, PaneableComponent.Inbox, {})
            }
          >
            <MenuIcon>
              <CiInboxIn size={18} />
            </MenuIcon>
            <MenuLabel>{t('inbox.title')}</MenuLabel>
            {!!inboxCount && (
              <Badge variant="solid" radius="full" size="1" ml="auto">
                {inboxCount}
              </Badge>
            )}
          </FeynoteCardItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.CreateNew}
          componentProps={{}}
          paneId={currentPane.id}
        >
          <FeynoteCardItem
            $isButton
            onClick={(event) =>
              navigateWithKeyboardHandler(
                event,
                PaneableComponent.CreateNew,
                {},
              )
            }
          >
            <MenuIcon>
              <IoAdd />
            </MenuIcon>
            <MenuLabel>{t('menu.new')}</MenuLabel>
          </FeynoteCardItem>
        </SideMenuItemContextMenu>
      </FeynoteCard>

      {showTreeCard && (
        <TreeCard>
          <FeynoteCardHeader>
            <LuFolderTree color="var(--text-color-dim)" />
            <FeynoteCardHeaderLabel>
              {t(currentWorkspaceId ? 'menu.tree.workspace' : 'menu.tree')}
            </FeynoteCardHeaderLabel>
            <InfoButton
              message={t('menu.tree.help')}
              docsLink="https://docs.feynote.com/documents/tree/#organizing-documents"
            />
            <IconButton
              onClick={(event) =>
                navigateWithKeyboardHandler(
                  event,
                  PaneableComponent.ArtifactTreeFullpage,
                  { workspaceId: currentWorkspaceId },
                )
              }
            >
              <IoExpand />
            </IconButton>
          </FeynoteCardHeader>
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
        <FeynoteCard>
          <FeynoteCardHeader>
            <IoChatbubbles color="var(--text-color-dim)" />
            <FeynoteCardHeaderLabel>
              {t('menu.recentlyUpdatedThreads')}
            </FeynoteCardHeaderLabel>
            <IconButton
              onClick={(event) =>
                navigateWithKeyboardHandler(
                  event,
                  PaneableComponent.AIThreadsList,
                  {},
                )
              }
            >
              <IoExpand />
            </IconButton>
          </FeynoteCardHeader>
          {filteredThreads
            .slice(0, RECENT_ARTIFACTS_LIMIT)
            .map((recentlyUpdatedThread) => (
              <AIThreadContextMenu
                key={recentlyUpdatedThread.id}
                id={recentlyUpdatedThread.id}
                title={recentlyUpdatedThread.title || t('generic.untitled')}
                paneId={currentPane.id}
                onDelete={load}
                onTitleChange={() => load()}
              >
                <FeynoteCardItem
                  $isButton
                  onClick={(event) =>
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.AIThread,
                      { id: recentlyUpdatedThread.id },
                    )
                  }
                >
                  <FeynoteCardItemLabel>
                    {recentlyUpdatedThread.title || t('generic.untitled')}
                  </FeynoteCardItemLabel>
                </FeynoteCardItem>
              </AIThreadContextMenu>
            ))}
          {filteredThreads.length > RECENT_ARTIFACTS_LIMIT && (
            <Flex justify="center" py="1">
              <Button
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
                {t('menu.more')}
              </Button>
            </Flex>
          )}
        </FeynoteCard>
      )}

      <FeynoteCard>
        <SideMenuItemContextMenu
          component={PaneableComponent.Contribute}
          componentProps={{}}
          paneId={currentPane.id}
        >
          <FeynoteCardItem
            $isButton
            onClick={(event) =>
              navigateWithKeyboardHandler(
                event,
                PaneableComponent.Contribute,
                {},
              )
            }
          >
            <MenuIcon>
              <FaHeart />
            </MenuIcon>
            <MenuLabel>{t('menu.contribute')}</MenuLabel>
          </FeynoteCardItem>
        </SideMenuItemContextMenu>
        <SideMenuItemContextMenu
          component={PaneableComponent.Settings}
          componentProps={{}}
          paneId={currentPane.id}
        >
          <FeynoteCardItem
            $isButton
            onClick={(event) =>
              navigateWithKeyboardHandler(event, PaneableComponent.Settings, {})
            }
          >
            <MenuIcon>
              <IoSettings />
            </MenuIcon>
            <MenuLabel>{t('menu.settings')}</MenuLabel>
          </FeynoteCardItem>
        </SideMenuItemContextMenu>
      </FeynoteCard>

      {!showTreeCard && <div></div>}

      <ConnectionStatusContainer>
        <AppConnectionStatus />
      </ConnectionStatusContainer>
    </Container>
  );
};
