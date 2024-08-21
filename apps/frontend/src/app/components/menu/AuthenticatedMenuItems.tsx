import {
  IonButton,
  IonCard,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuToggle,
} from '@ionic/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { routes } from '../../routes';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../../utils/trpc';
import styled from 'styled-components';
import { add } from 'ionicons/icons';
import { EventContext } from '../../context/events/EventContext';
import { EventName } from '../../context/events/EventName';
import { ImmediateDebouncer } from '@feynote/shared-utils';
import { useLocation } from 'react-router-dom';
import type { ArtifactDTO } from '@feynote/prisma/types';
import { PaneControlContext } from '../../context/paneControl/PaneControlContext';
import { Artifact } from '../artifact/Artifact';
import { Dashboard } from '../dashboard/Dashboard';
import { Settings } from '../settings/Settings';

const CompactIonItem = styled(IonItem)`
  --min-height: 34px;
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
  const { openInNewTab, push } = useContext(PaneControlContext);
  /**
   * Re-render this component whenever navigation changes
   */
  const location = useLocation();
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
  }, [location]);

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
        <IonMenuToggle autoHide={false}>
          <IonItem
            onClick={() =>
              push(undefined, {
                title: t('menu.dashboard'),
                component: <Dashboard />,
                navigationEventId: crypto.randomUUID(),
              })
            }
            button
          >
            <IonLabel>{t('menu.dashboard')}</IonLabel>
          </IonItem>
        </IonMenuToggle>
      </IonCard>

      {!!pinnedArtifacts.length && (
        <IonCard>
          <IonList>
            <IonListHeader>
              <IonLabel>{t('menu.pinned')}</IonLabel>
              <IonButton size="small">
                <IonIcon icon={add} slot="icon-only" />
              </IonButton>
            </IonListHeader>
            {pinnedArtifacts
              .slice(0, pinnedArtifactsLimit)
              .map((pinnedArtifact) => (
                <CompactIonItem
                  key={pinnedArtifact.id}
                  onClick={() =>
                    push(undefined, {
                      title: pinnedArtifact.title,
                      component: <Artifact id={pinnedArtifact.id} />,
                      navigationEventId: crypto.randomUUID(),
                    })
                  }
                  button
                >
                  {pinnedArtifact.title}
                </CompactIonItem>
              ))}
            {pinnedArtifacts.length > pinnedArtifactsLimit && (
              <IonButton onClick={showMorePinned} fill="clear" size="small">
                {t('menu.more')}
              </IonButton>
            )}
          </IonList>
        </IonCard>
      )}

      {!!recentlyUpdatedArtifacts.length && (
        <IonCard>
          <IonList>
            <IonListHeader>
              <IonLabel>{t('menu.recentlyUpdated')}</IonLabel>
            </IonListHeader>
            {recentlyUpdatedArtifacts
              .slice(0, recentlyUpdatedArtifactsLimit)
              .map((recentlyUpdatedArtifact) => (
                <CompactIonItem
                  key={recentlyUpdatedArtifact.id}
                  onClick={() =>
                    push(undefined, {
                      title: recentlyUpdatedArtifact.title,
                      component: <Artifact id={recentlyUpdatedArtifact.id} />,
                      navigationEventId: crypto.randomUUID(),
                    })
                  }
                  button
                >
                  {recentlyUpdatedArtifact.title}
                </CompactIonItem>
              ))}
            {recentlyUpdatedArtifacts.length >
              recentlyUpdatedArtifactsLimit && (
              <IonButton onClick={showMoreRecent} fill="clear" size="small">
                {t('menu.more')}
              </IonButton>
            )}
          </IonList>
        </IonCard>
      )}

      <IonCard>
        <IonMenuToggle autoHide={false}>
          <IonItem
            onClick={() =>
              openInNewTab({
                title: t('menu.settings'),
                component: <Settings />,
                navigationEventId: crypto.randomUUID(),
              })
            }
            button
          >
            <IonLabel>{t('menu.settings')}</IonLabel>
          </IonItem>
        </IonMenuToggle>
        <IonMenuToggle autoHide={false}>
          <IonItem onClick={signOut} routerLink={routes.login.build()}>
            <IonLabel>{t('menu.signOut')}</IonLabel>
          </IonItem>
        </IonMenuToggle>
      </IonCard>
    </>
  );
};
