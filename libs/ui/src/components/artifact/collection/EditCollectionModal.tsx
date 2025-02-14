import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { collaborationManager } from '../../editor/collaborationManager';
import { useContext, useEffect, useMemo, useReducer } from 'react';
import { SessionContext } from '../../../context/session/SessionContext';
import {
  ARTIFACT_COLLECTION_META_KEY,
  getMetaFromYArtifactCollection,
} from '@feynote/shared-utils';
import { ArtifactCollectionAccessLevel } from '@prisma/client';
import { CollectionSharingEditor } from './CollectionSharingEditor';

interface Props {
  collectionId: string;
  onDismiss: () => void;
}

export const EditCollectionModal = (props: Props) => {
  const { t } = useTranslation();
  const [triggerRerender, _rerenderReducerValue] = useReducer((x) => x + 1, 0);
  const { session } = useContext(SessionContext);

  const connection = collaborationManager.get(
    `artifactCollection:${props.collectionId}`,
    session,
  );

  const yMeta = useMemo(() => {
    return getMetaFromYArtifactCollection(connection.yjsDoc);
  }, [_rerenderReducerValue]);

  useEffect(() => {
    const map = connection.yjsDoc.getMap(ARTIFACT_COLLECTION_META_KEY);
    map.observeDeep(triggerRerender);

    return () => {
      map.unobserveDeep(triggerRerender);
    };
  }, [connection.yjsDoc]);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('collection.edit')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={props.onDismiss}>
              <IonIcon slot="icon-only" icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonInput
              label={t('collection.title')}
              type="text"
              value={yMeta.title}
              onIonChange={(event) => {
                connection.yjsDoc
                  .getMap(ARTIFACT_COLLECTION_META_KEY)
                  .set('title', event.detail.value || '');
              }}
            />
          </IonItem>
          <IonItem>
            <IonLabel>{t('collection.allowPublicAccess')}</IonLabel>
            <IonCheckbox
              checked={yMeta.linkAccessLevel !== undefined}
              onIonChange={(event) => {
                connection.yjsDoc
                  .getMap(ARTIFACT_COLLECTION_META_KEY)
                  .set(
                    'linkAccessLevel',
                    event.detail.checked
                      ? ArtifactCollectionAccessLevel.readonly
                      : undefined,
                  );
              }}
            />
          </IonItem>
          <CollectionSharingEditor yDoc={connection.yjsDoc} />
        </IonList>
        <IonButton expand="block" onClick={props.onDismiss}>
          {t('generic.done')}
        </IonButton>
      </IonContent>
    </>
  );
};
