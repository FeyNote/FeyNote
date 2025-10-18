import {
  IonButton,
  IonCard,
  IonIcon,
  IonLabel,
  IonList,
  IonListHeader,
} from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { useSessionContext } from '../../context/session/SessionContext';
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
  chatboxEllipses,
  gitNetwork,
  home,
  logOut,
  search,
  settings,
  add,
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
import { LuFolderTree } from '../AppIcons';
import { useGlobalPaneContext } from '../../context/globalPane/GlobalPaneContext';

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
  grid-template-rows: min-content ${(props) =>
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
  const { setSession } = useSessionContext();
  const { t } = useTranslation();

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

  const showMoreThreads = () => {
    setRecentlyUpdatedThreadsLimit(
      recentlyUpdatedThreadsLimit + RECENT_THREADS_LIMIT_INC,
    );
  };

  const signOut = () => {
    setSession(null);
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

  const showTreeCard = getPreference(PreferenceNames.LeftPaneShowArtifactTree);
  const showThreadsCard =
    !!recentlyUpdatedThreads.length &&
    getPreference(PreferenceNames.LeftPaneShowRecentThreads);

  return (
    <Container
      $isTreeCardShowing={showTreeCard}
      $isThreadsShowing={showThreadsCard}
    >
      <SidebarCard>
        <CompactIonItem
          lines="none"
          onClick={() => triggerGlobalSearch()}
          button
        >
          <IonIcon icon={search} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.search')}</IonLabel>
        </CompactIonItem>
        <CompactIonItem
          lines="none"
          onClick={(event) =>
            navigateWithKeyboardHandler(event, PaneableComponent.Dashboard, {})
          }
          button
        >
          <IonIcon icon={home} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.dashboard')}</IonLabel>
        </CompactIonItem>
        <CompactIonItem
          lines="none"
          onClick={(event) =>
            navigateWithKeyboardHandler(
              event,
              PaneableComponent.AllArtifacts,
              {},
            )
          }
          button
        >
          <IonIcon icon={list} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.allArtifacts')}</IonLabel>
        </CompactIonItem>
        <CompactIonItem
          lines="none"
          onClick={(event) =>
            navigateWithKeyboardHandler(event, PaneableComponent.Graph, {})
          }
          button
        >
          <IonIcon icon={gitNetwork} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.graph')}</IonLabel>
        </CompactIonItem>
        <CompactIonItem
          lines="none"
          onClick={(event) =>
            navigateWithKeyboardHandler(
              event,
              PaneableComponent.NewArtifact,
              {},
            )
          }
          button
        >
          <IonIcon icon={add} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.new')}</IonLabel>
        </CompactIonItem>
      </SidebarCard>

      {showTreeCard && (
        <TreeCard>
          <IonList class="ion-no-padding">
            <IonListHeader lines="full">
              <LuFolderTree color="rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54)" />
              &nbsp;&nbsp;
              <IonLabel>{t('menu.tree')}</IonLabel>
              <InfoButton message={t('menu.tree.help')} />
            </IonListHeader>
          </IonList>
          <ArtifactTree
            treeId={TREE_ID}
            registerAsGlobalTreeDragHandler={true}
            editable={true}
            mode="navigate"
            enableItemContextMenu={true}
          />
        </TreeCard>
      )}

      {showThreadsCard && (
        <SidebarCard>
          <IonList class="ion-no-padding">
            <IonListHeader lines="full">
              <IonIcon icon={chatboxEllipses} />
              &nbsp;&nbsp;
              <IonLabel>{t('menu.recentlyUpdatedThreads')}</IonLabel>
            </IonListHeader>
            {recentlyUpdatedThreads
              .slice(0, recentlyUpdatedThreadsLimit)
              .map((recentlyUpdatedThread) => (
                <CompactIonItem
                  lines="none"
                  key={recentlyUpdatedThread.id}
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
              ))}
            {recentlyUpdatedThreads.length > recentlyUpdatedThreadsLimit && (
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
        <CompactIonItem
          lines="none"
          onClick={(event) =>
            navigateWithKeyboardHandler(event, PaneableComponent.Contribute, {})
          }
          button
        >
          <IonIcon icon={heart} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.contribute')}</IonLabel>
        </CompactIonItem>
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
        <CompactIonItem lines="none" onClick={signOut} button>
          <IonIcon icon={logOut} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.signOut')}</IonLabel>
        </CompactIonItem>
      </SidebarCard>

      {!showTreeCard && <div></div>}

      <ConnectionStatusContainer>
        <AppConnectionStatus />
      </ConnectionStatusContainer>
    </Container>
  );
};
