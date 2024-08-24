import {
  IonButton,
  IonCard,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
} from '@ionic/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../../utils/trpc';
import styled from 'styled-components';
import { EventContext } from '../../context/events/EventContext';
import { EventName } from '../../context/events/EventName';
import { ImmediateDebouncer } from '@feynote/shared-utils';
import type { ArtifactDTO } from '@feynote/prisma/types';
import {
  PaneControlContext,
  PaneTransition,
} from '../../context/paneControl/PaneControlContext';
import { Artifact } from '../artifact/Artifact';
import { Dashboard } from '../dashboard/Dashboard';
import { Settings } from '../settings/Settings';
import { home, logOut, pin, settings, telescope } from 'ionicons/icons';

const CompactIonItem = styled(IonItem)`
  --min-height: 34px;
  font-size: 0.875rem;
`;

const NowrapIonLabel = styled(IonLabel)`
  text-wrap: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

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
 * Reload debounce interval in ms
 */
const RELOAD_DEBOUNCE_INTERVAL = 5000;

export const AuthenticatedMenuItems: React.FC = () => {
  const { t } = useTranslation();
  const { setSession } = useContext(SessionContext);
  const { eventManager } = useContext(EventContext);
  const { navigate, get } = useContext(PaneControlContext);
  const [pinnedArtifacts, setPinnedArtifacts] = useState<ArtifactDTO[]>([]);
  const [pinnedArtifactsLimit, setPinnedArtifactsLimit] = useState(
    PINNED_ARTIFACTS_LIMIT_DEFAULT,
  );
  const [recentlyUpdatedArtifacts, setRecentlyUpdatedArtifacts] = useState<
    ArtifactDTO[]
  >([]);
  const [recentlyUpdatedArtifactsLimit, setRecentlyUpdatedArtifactsLimit] =
    useState(RECENT_ARTIFACTS_LIMIT_DEFAULT);

  const showMorePinned = () => {
    setPinnedArtifactsLimit(pinnedArtifactsLimit + PINNED_ARTIFACTS_LIMIT_INC);
  };

  const showMoreRecent = () => {
    setRecentlyUpdatedArtifactsLimit(
      recentlyUpdatedArtifactsLimit + RECENT_ARTIFACTS_LIMIT_INC,
    );
  };

  const signOut = () => {
    setSession(null);
  };

  const load = () => {
    trpc.artifact.getArtifacts
      .query({})
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
  }, [get(undefined)]);

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
          onClick={() =>
            navigate(undefined, <Dashboard />, PaneTransition.Push)
          }
          button
        >
          <IonIcon icon={home} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.dashboard')}</IonLabel>
        </CompactIonItem>
      </IonCard>

      {!!pinnedArtifacts.length && (
        <IonCard>
          <IonList>
            <IonListHeader>
              <IonIcon icon={pin} />
              &nbsp;&nbsp;
              <IonLabel>{t('menu.pinned')}</IonLabel>
            </IonListHeader>
            {pinnedArtifacts
              .slice(0, pinnedArtifactsLimit)
              .map((pinnedArtifact) => (
                <CompactIonItem
                  key={pinnedArtifact.id}
                  onClick={() =>
                    navigate(
                      undefined,
                      <Artifact id={pinnedArtifact.id} />,
                      PaneTransition.Push,
                    )
                  }
                  button
                >
                  <NowrapIonLabel>{pinnedArtifact.title}</NowrapIonLabel>
                </CompactIonItem>
              ))}
            {pinnedArtifacts.length > pinnedArtifactsLimit && (
              <IonButton onClick={showMorePinned} fill="clear" size="small">
                <ShowMoreButtonText>{t('menu.more')}</ShowMoreButtonText>
              </IonButton>
            )}
          </IonList>
        </IonCard>
      )}

      {!!recentlyUpdatedArtifacts.length && (
        <IonCard>
          <IonList>
            <IonListHeader>
              <IonIcon icon={telescope} />
              &nbsp;&nbsp;
              <IonLabel>{t('menu.recentlyUpdated')}</IonLabel>
            </IonListHeader>
            {recentlyUpdatedArtifacts
              .slice(0, recentlyUpdatedArtifactsLimit)
              .map((recentlyUpdatedArtifact) => (
                <CompactIonItem
                  key={recentlyUpdatedArtifact.id}
                  onClick={() =>
                    navigate(
                      undefined,
                      <Artifact id={recentlyUpdatedArtifact.id} />,
                      PaneTransition.Push,
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
              <IonButton onClick={showMoreRecent} fill="clear" size="small">
                <ShowMoreButtonText>{t('menu.more')}</ShowMoreButtonText>
              </IonButton>
            )}
          </IonList>
        </IonCard>
      )}

      <IonCard>
        <CompactIonItem
          onClick={() => navigate(undefined, <Settings />, PaneTransition.Push)}
          button
        >
          <IonIcon icon={settings} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.settings')}</IonLabel>
        </CompactIonItem>
        <CompactIonItem onClick={signOut} button>
          <IonIcon icon={logOut} size="small" />
          &nbsp;&nbsp;
          <IonLabel>{t('menu.signOut')}</IonLabel>
        </CompactIonItem>
      </IonCard>
    </>
  );
};
