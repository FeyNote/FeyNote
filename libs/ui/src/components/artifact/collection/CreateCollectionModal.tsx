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
import { trpc } from '../../../utils/trpc';
import { useHandleTRPCErrors } from '../../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { encodeStateAsUpdate, Map as YMap } from 'yjs';
import {
  constructYArtifactCollection,
  getMetaFromYArtifactCollection,
  updateYArtifactCollectionMeta,
} from '@feynote/shared-utils';
import { useContext, useState } from 'react';
import { ArtifactCollectionAccessLevel } from '@prisma/client';
import { CollectionSharingEditor } from './CollectionSharingEditor';
import { SessionContext } from '../../../context/session/SessionContext';

interface Props {
  onDismiss: () => void;
}

export const CreateCollectionModal = (props: Props) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [publiclyVisible, setPubliclyVisible] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { session } = useContext(SessionContext);
  const [id] = useState(() => crypto.randomUUID());
  const [yDoc] = useState(() => {
    const yDoc = constructYArtifactCollection({
      id,
      title,
      linkAccessLevel: undefined,
      userAccess: new YMap(),
    });

    const currentMeta = getMetaFromYArtifactCollection(yDoc);
    const userAccess = currentMeta.userAccess ?? new YMap();
    userAccess.set(session.userId, {
      accessLevel: ArtifactCollectionAccessLevel.coowner,
    });

    return yDoc;
  });

  const create = () => {
    if (!title) {
      return;
    }

    const linkAccessLevel: ArtifactCollectionAccessLevel | undefined =
      publiclyVisible ? ArtifactCollectionAccessLevel.readonly : undefined;

    updateYArtifactCollectionMeta(yDoc, {
      title,
      linkAccessLevel,
    });

    const yBin = encodeStateAsUpdate(yDoc);
    trpc.artifactCollection.upsertArtifactCollection
      .mutate({
        id,
        yBin,
      })
      .then(() => {
        props.onDismiss();
      })
      .catch(handleTRPCErrors);
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('artifact.collection.create.header')}</IonTitle>
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
            <IonLabel position="stacked">
              {t('artifact.collection.create.title')}
            </IonLabel>
            <IonInput
              type="text"
              value={title}
              onIonChange={(e) => setTitle(e.detail.value || '')}
            />
          </IonItem>
          <IonItem>
            <IonLabel>
              {t('artifact.collection.create.publiclyVisible')}
            </IonLabel>
            <IonCheckbox
              checked={publiclyVisible}
              onIonChange={(e) => setPubliclyVisible(e.detail.checked)}
            />
          </IonItem>
          <CollectionSharingEditor yDoc={yDoc} />
        </IonList>
        <IonButton expand="block" onClick={create}>
          {t('generic.create')}
        </IonButton>
      </IonContent>
    </>
  );
};
