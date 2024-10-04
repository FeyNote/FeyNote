import type { ArtifactDTO } from '@feynote/prisma/types';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonListHeader,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { close, person, trash } from 'ionicons/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoButton } from '../info/InfoButton';
import { trpc } from '../../utils/trpc';
import { handleTRPCErrors } from '../../utils/handleTRPCErrors';
import { ArtifactSharingAccessLevel } from './ArtifactSharingAccessLevel';
import { ArtifactSharingLinkAdd } from './ArtifactSharingLinkAdd';
import { CopyWithWebshareButton } from '../info/CopyWithWebshareButton';
import styled from 'styled-components';
import { SessionContext } from '../../context/session/SessionContext';

const ShareLinkDisplay = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto;

  a {
    word-wrap: anywhere;
  }

  span {
    white-space: nowrap;
  }
`;

const accessLevelToI18n = {
  coowner: 'artifactSharing.coowner',
  noaccess: 'artifactSharing.noaccess',
  readwrite: 'artifactSharing.readwrite',
  readonly: 'artifactSharing.readonly',
};

interface Props {
  artifactId: string;
  dismiss: () => void;
}

export const ArtifactSharingManagementModal: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const { session } = useContext(SessionContext);
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<{
    id: string;
    email: string;
  }>();
  const [knownUsers, setKnownUsers] = useState<
    {
      id: string;
      email: string;
    }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const sharedUserIdsToAccessLevel = useMemo(() => {
    if (!artifact) return new Map();

    return new Map(
      artifact.artifactShares.map((el) => [el.userId, el.accessLevel]),
    );
  }, [artifact]);
  const knownUserEmailsById = useMemo(() => {
    return new Map(knownUsers.map((el) => [el.id, el.email]));
  }, [knownUsers]);

  const getKnownUsers = async () => {
    await trpc.user.getKnownUsers
      .query()
      .then((result) => {
        setKnownUsers(result);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };
  const getArtifact = async () => {
    await trpc.artifact.getArtifactById
      .query({
        id: props.artifactId,
      })
      .then((result) => {
        setArtifact(result);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  useEffect(() => {
    Promise.all([getKnownUsers(), getArtifact()]).then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!searchText.length || !searchText.includes('@')) {
      setSearchResult(undefined);
      setSearching(false);
      return;
    }

    setSearching(true);

    trpc.user.getByEmail
      .query({
        email: searchText,
      })
      .then((result) => {
        if (session.userId === result.id) {
          // Do not allow sharing with yourself
          setSearchResult(undefined);
          return;
        }

        setSearchResult(result);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast, {
          400: () => {
            // Do nothing (expected if the user types an invalid email format)
          },
          404: () => {
            // Do nothing (expected if the user types an email for a user who does not exist in the system)
          },
        });
        setSearchResult(undefined);
      })
      .finally(() => {
        setSearching(false);
      });
  }, [searchText]);

  const onAccessLevelChanged = async (
    userId: string,
    accessLevel: 'noaccess' | 'readwrite' | 'readonly' | 'coowner',
  ) => {
    if (accessLevel === 'noaccess') {
      await trpc.artifactShare.deleteArtifactShare
        .mutate({
          userId,
          artifactId: props.artifactId,
        })
        .catch((error) => {
          handleTRPCErrors(error, presentToast);
        });
    } else {
      await trpc.artifactShare.upsertArtifactShare
        .mutate({
          userId,
          artifactId: props.artifactId,
          accessLevel,
        })
        .catch((error) => {
          handleTRPCErrors(error, presentToast);
        });
    }

    await Promise.all([getArtifact(), getKnownUsers()]);
  };

  const onArtifactShareTokenDeleteClicked = async (shareTokenId: string) => {
    presentAlert({
      header: t('artifactSharing.links.delete.title'),
      message: t('artifactSharing.links.delete.message'),
      buttons: [
        {
          text: t('generic.cancel'),
        },
        {
          text: t('generic.delete'),
          handler: () => {
            deleteArtifactShareToken(shareTokenId);
          },
        },
      ],
    });
  };

  const deleteArtifactShareToken = async (shareTokenId: string) => {
    await trpc.artifactShareToken.deleteArtifactShareToken
      .mutate({
        id: shareTokenId,
      })
      .catch((error) => {
        handleTRPCErrors(presentToast, error);
      });

    await getArtifact();
  };

  const knownUsersNotSharedTo = knownUsers.filter(
    (el) => !sharedUserIdsToAccessLevel.has(el.id),
  );

  const buildShareUrl = (shareToken: string) => {
    return `${window.location.origin}/artifact/${props.artifactId}?shareToken=${shareToken}`;
  };

  if (loading || !artifact) return;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('artifactSharing.title')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={props.dismiss}>
              <IonIcon slot="icon-only" icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonListHeader>
            <IonIcon icon={person} size="small" />
            &nbsp;&nbsp;
            {t('artifactSharing.existing')}
            <InfoButton message={t('artifactSharing.existing.help')} />
          </IonListHeader>
          {artifact.artifactShares.map((artifactShare) => (
            <IonItem key={artifactShare.id} lines="none">
              <ArtifactSharingAccessLevel
                label={knownUserEmailsById.get(artifactShare.userId)}
                accessLevel={artifactShare.accessLevel || 'noaccess'}
                onChange={(accessLevel) =>
                  onAccessLevelChanged(artifactShare.userId, accessLevel)
                }
              />
            </IonItem>
          ))}
          {!artifact.artifactShares.length && (
            <IonItem>{t('artifactSharing.noShares')}</IonItem>
          )}
        </IonCard>
        {!!knownUsersNotSharedTo.length && (
          <IonCard>
            <IonListHeader>
              <IonIcon icon={person} size="small" />
              &nbsp;&nbsp;
              {t('artifactSharing.knownUsers')}
              <InfoButton message={t('artifactSharing.knownUsers.help')} />
            </IonListHeader>
            {knownUsersNotSharedTo.map((knownUser) => (
              <IonItem key={knownUser.id} lines="none">
                <ArtifactSharingAccessLevel
                  label={knownUser.email}
                  accessLevel={
                    sharedUserIdsToAccessLevel.get(knownUser.id) || 'noaccess'
                  }
                  onChange={(accessLevel) =>
                    onAccessLevelChanged(knownUser.id, accessLevel)
                  }
                />
              </IonItem>
            ))}
          </IonCard>
        )}
        <IonCard>
          <IonListHeader>
            <IonIcon icon={person} size="small" />
            &nbsp;&nbsp;
            {t('artifactSharing.search')}
            <InfoButton message={t('artifactSharing.search.help')} />
          </IonListHeader>
          <IonItem lines="none">
            <IonSearchbar
              placeholder={t('artifactSharing.search.placeholder')}
              onIonInput={(event) =>
                setSearchText(event.detail.value as string)
              }
              onKeyDown={() => setSearching(true)}
              debounce={200}
            ></IonSearchbar>
          </IonItem>
          {!loading && !searching && !!searchText.length && !!searchResult && (
            <IonItem lines="none">
              <ArtifactSharingAccessLevel
                label={searchResult.email}
                accessLevel={
                  sharedUserIdsToAccessLevel.get(searchResult.id) || 'noaccess'
                }
                onChange={(accessLevel) =>
                  onAccessLevelChanged(searchResult.id, accessLevel)
                }
              />
            </IonItem>
          )}
          {!loading && !searching && !!searchText.length && !searchResult && (
            <IonItem>
              <IonLabel>{t('artifactSharing.search.noResult')}</IonLabel>
            </IonItem>
          )}
          {searching && (
            <IonItem>
              <IonLabel>{t('artifactSharing.search.searching')}</IonLabel>
            </IonItem>
          )}
        </IonCard>
        <IonCard>
          <IonListHeader>
            <IonIcon icon={person} size="small" />
            &nbsp;&nbsp;
            {t('artifactSharing.links')}
            <InfoButton message={t('artifactSharing.links.help')} />
          </IonListHeader>
          {artifact.artifactShareTokens.map((shareToken) => (
            <IonItem key={shareToken.id} lines="none">
              <IonLabel>
                <ShareLinkDisplay>
                  <a
                    href={buildShareUrl(shareToken.shareToken)}
                    target="_blank"
                  >
                    {buildShareUrl(shareToken.shareToken)}
                  </a>
                  <div>
                    <CopyWithWebshareButton
                      copyText={buildShareUrl(shareToken.shareToken)}
                      webshareTitle={artifact.title}
                      webshareURL={buildShareUrl(shareToken.shareToken)}
                    />
                    <IonButton
                      color="danger"
                      fill="clear"
                      onClick={() =>
                        onArtifactShareTokenDeleteClicked(shareToken.id)
                      }
                    >
                      <IonIcon slot="icon-only" icon={trash} />
                    </IonButton>
                  </div>
                  <p>
                    {t(accessLevelToI18n[shareToken.accessLevel])}&nbsp;-&nbsp;
                    {shareToken.allowAddToAccount
                      ? t('artifactSharing.links.allowAddToAccount')
                      : t('artifactSharing.links.noAddToAccount')}
                  </p>
                </ShareLinkDisplay>
              </IonLabel>
            </IonItem>
          ))}
          {!loading && !artifact.artifactShareTokens.length && (
            <IonItem lines="none">
              <IonLabel>{t('artifactSharing.links.null')}</IonLabel>
            </IonItem>
          )}
          {!loading && (
            <ArtifactSharingLinkAdd
              artifactId={props.artifactId}
              onAdded={() => getArtifact()}
            />
          )}
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
