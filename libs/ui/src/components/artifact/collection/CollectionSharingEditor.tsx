import {
  IonCard,
  IonIcon,
  IonItem,
  IonLabel,
  IonListHeader,
  IonSearchbar,
} from '@ionic/react';
import { person } from 'ionicons/icons';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoButton } from '../../info/InfoButton';
import { trpc } from '../../../utils/trpc';
import { useHandleTRPCErrors } from '../../../utils/useHandleTRPCErrors';
import { appIdbStorageManager } from '../../../utils/AppIdbStorageManager';
import { Doc as YDoc, Map as YMap } from 'yjs';
import {
  ARTIFACT_COLLECTION_META_KEY,
  getMetaFromYArtifactCollection,
} from '@feynote/shared-utils';
import { ArtifactCollectionAccessLevel } from '@prisma/client';
import { ArtifactCollectionSharingAccessLevel } from './ArtifactCollectionSharingAccessLevel';

interface Props {
  yDoc: YDoc;
}

export const CollectionSharingEditor: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
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
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const sharedUserIdsToAccessLevel = useMemo(() => {
    const { userAccess } = getMetaFromYArtifactCollection(props.yDoc);

    const map = new Map<string, ArtifactCollectionAccessLevel>();
    for (const [key, value] of (userAccess || new Map()).entries()) {
      map.set(key, value.accessLevel);
    }

    return map;
  }, [_rerenderReducerValue]);

  const knownUserEmailsById = useMemo(() => {
    return new Map(knownUsers.map((el) => [el.id, el.email]));
  }, [knownUsers]);

  const getKnownUsers = async () => {
    await trpc.user.getKnownUsers
      .query()
      .then((result) => {
        setKnownUsers(result);
      })
      .catch(() => {
        setKnownUsers([]);
      });
  };

  useEffect(() => {
    getKnownUsers().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const map = props.yDoc.getMap(ARTIFACT_COLLECTION_META_KEY);
    map.observeDeep(triggerRerender);

    return () => {
      map.unobserveDeep(triggerRerender);
    };
  }, [props.yDoc]);

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
    accessLevel: 'noaccess' | 'readwrite' | 'readonly' | 'readadd' | 'coowner',
  ) => {
    let accessMap = getMetaFromYArtifactCollection(props.yDoc).userAccess;
    if (!accessMap) {
      accessMap = new YMap();
      props.yDoc
        .getMap(ARTIFACT_COLLECTION_META_KEY)
        .set('userAccess', accessMap);
    }

    if (accessLevel === 'noaccess') {
      accessMap.delete(userId);
    } else {
      accessMap.set(userId, {
        accessLevel,
      });
    }

    await getKnownUsers();
  };

  const knownUsersNotSharedTo = knownUsers.filter(
    (el) => !sharedUserIdsToAccessLevel.has(el.id),
  );

  if (loading) return;

  return (
    <>
      <IonCard>
        <IonListHeader>
          <IonIcon icon={person} size="small" />
          &nbsp;&nbsp;
          {t('collectionSharing.existing')}
          <InfoButton message={t('collectionSharing.existing.help')} />
        </IonListHeader>
        {[...sharedUserIdsToAccessLevel.entries()].map(
          ([userId, accessLevel]) => (
            <IonItem key={userId} lines="none">
              <ArtifactCollectionSharingAccessLevel
                label={knownUserEmailsById.get(userId) || userId}
                accessLevel={accessLevel || 'noaccess'}
                onChange={(accessLevel) =>
                  onAccessLevelChanged(userId, accessLevel)
                }
              />
            </IonItem>
          ),
        )}
        {!sharedUserIdsToAccessLevel.size && (
          <IonItem>{t('collectionSharing.noShares')}</IonItem>
        )}
      </IonCard>
      {!!knownUsersNotSharedTo.length && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={person} size="small" />
            &nbsp;&nbsp;
            {t('collectionSharing.knownUsers')}
            <InfoButton message={t('collectionSharing.knownUsers.help')} />
          </IonListHeader>
          {knownUsersNotSharedTo.map((knownUser) => (
            <IonItem key={knownUser.id} lines="none">
              <ArtifactCollectionSharingAccessLevel
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
          {t('collectionSharing.search')}
          <InfoButton message={t('collectionSharing.search.help')} />
        </IonListHeader>
        <IonItem lines="none">
          <IonSearchbar
            placeholder={t('collectionSharing.search.placeholder')}
            onIonInput={(event) => setSearchText(event.detail.value as string)}
            onKeyDown={() => setSearching(true)}
            debounce={200}
          ></IonSearchbar>
        </IonItem>
        {!loading && !searching && !!searchText.length && !!searchResult && (
          <IonItem lines="none">
            <ArtifactCollectionSharingAccessLevel
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
            <IonLabel>{t('collectionSharing.search.noResult')}</IonLabel>
          </IonItem>
        )}
        {searching && (
          <IonItem>
            <IonLabel>{t('collectionSharing.search.searching')}</IonLabel>
          </IonItem>
        )}
      </IonCard>
    </>
  );
};
