import {
  IonButton,
  IonCard,
  IonIcon,
  IonLabel,
  IonList,
  IonListHeader,
} from '@ionic/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import styled from 'styled-components';
import { EventContext } from '../../context/events/EventContext';
import { EventName } from '../../context/events/EventName';
import { ImmediateDebouncer, PreferenceNames } from '@feynote/shared-utils';
import type { ArtifactDTO, ThreadDTO } from '@feynote/prisma/types';
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
  telescope,
} from 'ionicons/icons';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PreferencesContext } from '../../context/preferences/PreferencesContext';
import { GlobalSearchContext } from '../../context/globalSearch/GlobalSearchContext';
import { CompactIonItem } from '../CompactIonItem';
import { NowrapIonLabel } from '../NowrapIonLabel';

const ShowMoreButtonText = styled.span`
  font-size: 0.75rem;
`;

/**
 * The default number of pinned artifacts to show
 */
const PINNED_ARTIFACTS_LIMIT_DEFAULT = 10;
/**
 * How many more pinned artifacts to show when "more" is clicked
 */
const PINNED_ARTIFACTS_LIMIT_INC = 10;
/**
 * The default number of recent artifacts to show
 */
const RECENT_ARTIFACTS_LIMIT_DEFAULT = 5;
/**
 * How many more recent artifacts to show when "more" is clicked
 */
const RECENT_ARTIFACTS_LIMIT_INC = 10;
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
  const { getPreference } = useContext(PreferencesContext);
  const { setSession } = useContext(SessionContext);
  const { eventManager } = useContext(EventContext);
  const { navigate, getPaneById } = useContext(GlobalPaneContext);
  const { trigger: triggerGlobalSearch } = useContext(GlobalSearchContext);
  const currentPane = getPaneById(undefined);
  const [pinnedArtifacts, setPinnedArtifacts] = useState<ArtifactDTO[]>([]);
  const [pinnedArtifactsLimit, setPinnedArtifactsLimit] = useState(
    PINNED_ARTIFACTS_LIMIT_DEFAULT,
  );
  const [recentlyUpdatedArtifacts, setRecentlyUpdatedArtifacts] = useState<
    ArtifactDTO[]
  >([]);
  const [recentlyUpdatedArtifactsLimit, setRecentlyUpdatedArtifactsLimit] =
    useState(RECENT_ARTIFACTS_LIMIT_DEFAULT);
  const [recentlyUpdatedThreads, setRecentlyUpdatedThreads] = useState<
    ThreadDTO[]
  >([]);
  const [recentlyUpdatedThreadsLimit, setRecentlyUpdatedThreadsLimit] =
    useState(RECENT_ARTIFACTS_LIMIT_DEFAULT);

  const showMorePinned = () => {
    setPinnedArtifactsLimit(pinnedArtifactsLimit + PINNED_ARTIFACTS_LIMIT_INC);
  };

  const showMoreRecent = () => {
    setRecentlyUpdatedArtifactsLimit(
      recentlyUpdatedArtifactsLimit + RECENT_ARTIFACTS_LIMIT_INC,
    );
  };

  const showMoreThreads = () => {
    setRecentlyUpdatedThreadsLimit(
      recentlyUpdatedThreadsLimit + RECENT_THREADS_LIMIT_INC,
    );
  };

  const signOut = () => {
    setSession(null);
  };

  const load = () => {
    trpc.artifact.getArtifacts
      .query()
      .then((artifacts) => {
        setPinnedArtifacts(
          artifacts
            .filter((el) => el.isPinned)
            .sort((a, b) => a.title.localeCompare(b.title)),
        );

        setRecentlyUpdatedArtifacts(
          artifacts.sort(
            (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
          ),
        );
      })
      .catch((e) => {
        // TODO: Log to sentry
      });

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
      .catch((e) => {
        // TODO: Log to sentry
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
    const handler = (event: EventName) => {
      const immediateEvents = [
        EventName.ArtifactCreated,
        EventName.ArtifactPinned,
      ];
      const immediate = immediateEvents.includes(event);

      loadDebouncerRef.current.call(immediate);
    };

    eventManager.addEventListener(handler, [
      EventName.ArtifactCreated,
      EventName.ArtifactTitleUpdated,
      EventName.ArtifactPinned,
    ]);

    return () => {
      eventManager.removeEventListener(handler, [
        EventName.ArtifactCreated,
        EventName.ArtifactTitleUpdated,
        EventName.ArtifactPinned,
      ]);
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
      </IonCard>

      {!!pinnedArtifacts.length &&
        getPreference(PreferenceNames.LeftPaneShowPinnedArtifacts) && (
          <IonCard>
            <IonList class="ion-no-padding">
              <IonListHeader lines="full">
                <IonIcon icon={pin} />
                &nbsp;&nbsp;
                <IonLabel>{t('menu.pinned')}</IonLabel>
              </IonListHeader>
              {pinnedArtifacts
                .slice(0, pinnedArtifactsLimit)
                .map((pinnedArtifact) => (
                  <CompactIonItem
                    lines="none"
                    key={pinnedArtifact.id}
                    onClick={(event) =>
                      navigate(
                        undefined,
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
                    <NowrapIonLabel>{pinnedArtifact.title}</NowrapIonLabel>
                  </CompactIonItem>
                ))}
              {pinnedArtifacts.length > pinnedArtifactsLimit && (
                <IonButton
                  onClick={showMorePinned}
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

      {!!recentlyUpdatedArtifacts.length &&
        getPreference(PreferenceNames.LeftPaneShowRecentArtifacts) && (
          <IonCard>
            <IonList class="ion-no-padding">
              <IonListHeader lines="full">
                <IonIcon icon={telescope} />
                &nbsp;&nbsp;
                <IonLabel>{t('menu.recentlyUpdatedArtifacts')}</IonLabel>
              </IonListHeader>
              {recentlyUpdatedArtifacts
                .slice(0, recentlyUpdatedArtifactsLimit)
                .map((recentlyUpdatedArtifact) => (
                  <CompactIonItem
                    lines="none"
                    key={recentlyUpdatedArtifact.id}
                    onClick={(event) =>
                      navigate(
                        undefined,
                        PaneableComponent.Artifact,
                        { id: recentlyUpdatedArtifact.id },
                        event.metaKey || event.ctrlKey
                          ? PaneTransition.NewTab
                          : PaneTransition.Push,
                        !(event.metaKey || event.ctrlKey),
                      )
                    }
                    button
                  >
                    <NowrapIonLabel>
                      {recentlyUpdatedArtifact.title}
                    </NowrapIonLabel>
                  </CompactIonItem>
                ))}
              {recentlyUpdatedArtifacts.length >
                recentlyUpdatedArtifactsLimit && (
                <IonButton
                  onClick={showMoreRecent}
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
