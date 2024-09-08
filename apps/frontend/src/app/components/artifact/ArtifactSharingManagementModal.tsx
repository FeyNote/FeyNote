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
  useIonToast,
} from '@ionic/react';
import { close, person } from 'ionicons/icons';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoButton } from '../info/InfoButton';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { ArtifactSharingAccessLevel } from './ArtifactSharingAccessLevel';

interface Props {
  artifactId: string;
  dismiss: () => void;
}

export const ArtifactSharingManagementModal: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const [presentToast] = useIonToast();
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
        handleTRPCErrors(presentToast, error);
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
        handleTRPCErrors(presentToast, error);
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
        setSearchResult(result);
      })
      .catch((error) => {
        handleTRPCErrors(presentToast, error, {
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
          handleTRPCErrors(presentToast, error);
        });
    } else {
      await trpc.artifactShare.upsertArtifactShare
        .mutate({
          userId,
          artifactId: props.artifactId,
          accessLevel,
        })
        .catch((error) => {
          handleTRPCErrors(presentToast, error);
        });
    }

    await Promise.all([getArtifact(), getKnownUsers()]);
  };

  const knownUsersNotSharedTo = knownUsers.filter(
    (el) => !sharedUserIdsToAccessLevel.has(el.id),
  );

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
            <IonItem>
              <IonLabel>
                {knownUserEmailsById.get(artifactShare.userId)}
              </IonLabel>
              <ArtifactSharingAccessLevel
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
              <IonItem>
                <IonLabel>{knownUser.email}</IonLabel>
                <ArtifactSharingAccessLevel
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
          <IonItem>
            <IonSearchbar
              placeholder={t('artifactSharing.search.placeholder')}
              onIonInput={(event) =>
                setSearchText(event.detail.value as string)
              }
              debounce={200}
            ></IonSearchbar>
          </IonItem>
          {!loading && !searching && !!searchText.length && !!searchResult && (
            <IonItem>
              <IonLabel>{searchResult.email}</IonLabel>
              <ArtifactSharingAccessLevel
                accessLevel={
                  sharedUserIdsToAccessLevel.get(searchResult.id) || 'noaccess'
                }
                onChange={(accessLevel) =>
                  onAccessLevelChanged(searchResult.id, accessLevel)
                }
              />
            </IonItem>
          )}
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
