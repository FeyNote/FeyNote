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
} from '@ionic/react';
import { close, person } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoButton } from '../info/InfoButton';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { ArtifactSharingAccessLevel } from './ArtifactSharingAccessLevel';
import { ArtifactLinkAccessLevelSelect } from './ArtifactLinkAccessLevelSelect';
import { CopyWithWebshareButton } from '../info/CopyWithWebshareButton';
import styled from 'styled-components';
import { appIdbStorageManager } from '../../utils/localDb/AppIdbStorageManager';
import { CollaborationManagerConnection } from '../../utils/collaboration/collaborationManager';
import { useObserveYArtifactUserAccess } from '../../utils/collaboration/useObserveYArtifactUserAccess';
import { useObserveYArtifactMeta } from '../../utils/collaboration/useObserveYArtifactMeta';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import type { ArtifactAccessLevel } from '@prisma/client';

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

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
  dismiss: () => void;
}

export const ArtifactSharingManagementModal: React.FC<Props> = (props) => {
  const { t } = useTranslation();
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
  const allSeenUsers = useRef<
    Map<
      string,
      {
        id: string;
        email: string;
      }
    >
  >(new Map());
  const [searching, setSearching] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const { userAccessYKV } = useObserveYArtifactUserAccess(
    props.connection.yjsDoc,
  );
  const { title, linkAccessLevel } = useObserveYArtifactMeta(
    props.connection.yjsDoc,
  );

  useEffect(() => {
    if (searchResult) {
      allSeenUsers.current.set(searchResult.id, {
        id: searchResult.id,
        email: searchResult.email,
      });
    }
    for (const knownUser of knownUsers) {
      allSeenUsers.current.set(knownUser.id, {
        id: knownUser.id,
        email: knownUser.email,
      });
    }
  }, [searchResult, knownUsers]);

  const getKnownUsers = async () => {
    await trpc.user.getKnownUsers
      .query()
      .then((result) => {
        setKnownUsers(result);
      })
      .catch(() => {
        // Do nothing, we don't care about errors here
      });
  };

  useEffect(() => {
    getKnownUsers();
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
      .then(async (result) => {
        const session = await appIdbStorageManager.getSession();
        if (session?.userId === result.id) {
          // Do not allow sharing with yourself
          setSearchResult(undefined);
          return;
        }

        setSearchResult(result);
      })
      .catch((error) => {
        handleTRPCErrors(error, {
          400: () => {
            // Do nothing (expected if the user types an invalid email format)
          },
          412: () => {
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
      userAccessYKV.delete(userId);
    } else {
      userAccessYKV.set(userId, {
        accessLevel,
      });
    }
  };

  const linkAccessLevelChanged = (linkAccessLevel: ArtifactAccessLevel) => {
    props.connection.yjsDoc
      .getMap(ARTIFACT_META_KEY)
      .set('linkAccessLevel', linkAccessLevel);
  };

  const knownUsersNotSharedTo = knownUsers.filter(
    (el) => !userAccessYKV.has(el.id),
  );

  const shareUrl = `https://feynote.com/artifact/${props.artifactId}`;

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
          {userAccessYKV.yarray.map(({ key, val }) => (
            <IonItem key={key} lines="none">
              <ArtifactSharingAccessLevel
                label={allSeenUsers.current.get(key)?.email || key}
                accessLevel={val.accessLevel || 'noaccess'}
                onChange={(accessLevel) =>
                  onAccessLevelChanged(key, accessLevel)
                }
              />
            </IonItem>
          ))}
          {!userAccessYKV.yarray.length && (
            <IonItem>{t('artifactSharing.noShares')}</IonItem>
          )}
          {!!knownUsersNotSharedTo.length && (
            <>
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
                      userAccessYKV.get(knownUser.id)?.accessLevel || 'noaccess'
                    }
                    onChange={(accessLevel) =>
                      onAccessLevelChanged(knownUser.id, accessLevel)
                    }
                  />
                </IonItem>
              ))}
            </>
          )}
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
          {!searching && !!searchText.length && !!searchResult && (
            <IonItem lines="none">
              <ArtifactSharingAccessLevel
                label={searchResult.email}
                accessLevel={
                  userAccessYKV.get(searchResult.id)?.accessLevel || 'noaccess'
                }
                onChange={(accessLevel) =>
                  onAccessLevelChanged(searchResult.id, accessLevel)
                }
              />
            </IonItem>
          )}
          {!searching && !!searchText.length && !searchResult && (
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
        <br />
        <br />
        <IonCard>
          <IonListHeader>
            <IonIcon icon={person} size="small" />
            &nbsp;&nbsp;
            {t('artifactSharing.link')}
            <InfoButton message={t('artifactSharing.link.help')} />
          </IonListHeader>
          <ArtifactLinkAccessLevelSelect
            artifactAccessLevel={linkAccessLevel || 'noaccess'}
            setArtifactAccessLevel={linkAccessLevelChanged}
          />
          {linkAccessLevel !== 'noaccess' && (
            <IonItem lines="none">
              <IonLabel>
                <ShareLinkDisplay>
                  <a href={shareUrl} target="_blank" rel="noreferrer">
                    {shareUrl}
                  </a>
                  <div>
                    <CopyWithWebshareButton
                      copyText={shareUrl}
                      webshareTitle={title}
                      webshareURL={shareUrl}
                    />
                  </div>
                </ShareLinkDisplay>
              </IonLabel>
            </IonItem>
          )}
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
