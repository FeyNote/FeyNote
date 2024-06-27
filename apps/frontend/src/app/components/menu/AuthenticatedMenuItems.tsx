import {
  IonButton,
  IonCard,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuToggle,
} from '@ionic/react';
import { useContext, useEffect, useState } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { routes } from '../../routes';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../../utils/trpc';
import { ArtifactSummary } from '@feynote/prisma/types';

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

export const AuthenticatedMenuItems: React.FC = () => {
  const { t } = useTranslation();
  const { setSession } = useContext(SessionContext);
  const [pinnedArtifacts, setPinnedArtifacts] = useState<ArtifactSummary[]>([]);
  const [pinnedArtifactsLimit, setPinnedArtifactsLimit] = useState(
    PINNED_ARTIFACTS_LIMIT_DEFAULT,
  );
  const [recentlyUpdatedArtifacts, setRecentlyUpdatedArtifacts] = useState<
    ArtifactSummary[]
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

  useEffect(() => {
    // TODO: Re-load based on context so changes to artifacts update menu
    load();
  }, []);

  return (
    <>
      <IonCard>
        <IonMenuToggle autoHide={false}>
          <IonItem routerLink={routes.dashboard.build()}>
            <IonLabel>{t('menu.dashboard')}</IonLabel>
          </IonItem>
        </IonMenuToggle>
      </IonCard>

      {!!pinnedArtifacts.length && (
        <IonCard>
          <IonList>
            <IonListHeader>
              <IonLabel>{t('menu.pinned')}</IonLabel>
            </IonListHeader>
            {pinnedArtifacts
              .slice(0, pinnedArtifactsLimit)
              .map((pinnedArtifact) => (
                <IonItem
                  key={pinnedArtifact.id}
                  routerLink={routes.artifact.build({ id: pinnedArtifact.id })}
                >
                  <IonLabel>{pinnedArtifact.title}</IonLabel>
                </IonItem>
              ))}
            {pinnedArtifacts.length > pinnedArtifactsLimit && (
              <IonButton onClick={showMorePinned} fill="clear">
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
                <IonItem
                  key={recentlyUpdatedArtifact.id}
                  routerLink={routes.artifact.build({
                    id: recentlyUpdatedArtifact.id,
                  })}
                >
                  <IonLabel>{recentlyUpdatedArtifact.title}</IonLabel>
                </IonItem>
              ))}
            {recentlyUpdatedArtifacts.length >
              recentlyUpdatedArtifactsLimit && (
              <IonButton onClick={showMoreRecent} fill="clear">
                {t('menu.more')}
              </IonButton>
            )}
          </IonList>
        </IonCard>
      )}

      <IonCard>
        <IonMenuToggle autoHide={false}>
          <IonItem onClick={signOut} routerLink={routes.login.build()}>
            <IonLabel>{t('menu.signOut')}</IonLabel>
          </IonItem>
        </IonMenuToggle>
      </IonCard>
    </>
  );
};
