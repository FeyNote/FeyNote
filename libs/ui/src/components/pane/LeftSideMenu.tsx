import {
  IonButton,
  IonCard,
  IonIcon,
  IonLabel,
  IonList,
  IonListHeader,
} from '@ionic/react';
import { useContext, useEffect, useRef, useState } from 'react';
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
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import {
  chatboxEllipses,
  gitNetwork,
  home,
  logOut,
  pin,
  search,
  settings,
  add,
  heart,
  list,
} from 'ionicons/icons';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { GlobalSearchContext } from '../../context/globalSearch/GlobalSearchContext';
import { CompactIonItem } from '../CompactIonItem';
import { NowrapIonLabel } from '../NowrapIonLabel';
import { ArtifactTree } from '../artifact/ArtifactTree';
import { eventManager } from '../../context/events/EventManager';
import { InfoButton } from '../info/InfoButton';

const ShowMoreButtonText = styled.span`
  font-size: 0.75rem;
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
  const { navigate, getPaneById } = useContext(GlobalPaneContext);
  const { trigger: triggerGlobalSearch } = useContext(GlobalSearchContext);
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

  return (
    <>
      <IonCard>
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
            navigate(
              undefined,
              PaneableComponent.Dashboard,
              {},
              event.metaKey || event.ctrlKey
                ? PaneTransition.NewTab
                : PaneTransition.Push,
              !(event.metaKey || event.ctrlKey),
            )
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
            navigate(
              undefined,
              PaneableComponent.AllArtifacts,
              {},
              event.metaKey || event.ctrlKey
                ? PaneTransition.NewTab
                : PaneTransition.Push,
              !(event.metaKey || event.ctrlKey),
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
            navigate(
              undefined,
              PaneableComponent.Graph,
              {},
              event.metaKey || event.ctrlKey
                ? PaneTransition.NewTab
                : PaneTransition.Push,
              !(event.metaKey || event.ctrlKey),
            )
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
            navigate(
              undefined,
              PaneableComponent.NewArtifact,
              {},
              event.metaKey || event.ctrlKey
                ? PaneTransition.NewTab
                : PaneTransition.Push,
              !(event.metaKey || event.ctrlKey),
            )
          }
          button
        >
          <IonIcon icon={add} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.new')}</IonLabel>
        </CompactIonItem>
      </IonCard>

      <IonCard>
        <IonList class="ion-no-padding">
          <IonListHeader lines="full">
            <IonIcon icon={pin} />
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
      </IonCard>

      {!!recentlyUpdatedThreads.length &&
        getPreference(PreferenceNames.LeftPaneShowRecentThreads) && (
          <IonCard>
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
                      navigate(
                        undefined,
                        PaneableComponent.AIThread,
                        { id: recentlyUpdatedThread.id },
                        event.metaKey || event.ctrlKey
                          ? PaneTransition.NewTab
                          : PaneTransition.Push,
                        !(event.metaKey || event.ctrlKey),
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
          </IonCard>
        )}

      <IonCard>
        <CompactIonItem
          lines="none"
          onClick={(event) =>
            navigate(
              undefined,
              PaneableComponent.Contribute,
              {},
              event.metaKey || event.ctrlKey
                ? PaneTransition.NewTab
                : PaneTransition.Push,
              !(event.metaKey || event.ctrlKey),
            )
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
            navigate(
              undefined,
              PaneableComponent.Settings,
              {},
              event.metaKey || event.ctrlKey
                ? PaneTransition.NewTab
                : PaneTransition.Push,
              !(event.metaKey || event.ctrlKey),
            )
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
      </IonCard>
    </>
  );
};
