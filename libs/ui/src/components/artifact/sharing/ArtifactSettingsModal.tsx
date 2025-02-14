import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { close } from 'ionicons/icons';
import { collaborationManager } from '../../editor/collaborationManager';
import { useContext } from 'react';
import { SessionContext } from '../../../context/session/SessionContext';
import { ArtifactSharingEditor } from './ArtifactSharingEditor';

interface Props {
  artifactId: string;
  collectionId: string;
  dismiss: () => void;
}

export const ArtifactSettingsModal = (props: Props) => {
  const { t } = useTranslation();
  const { session } = useContext(SessionContext);

  const _artifactConnection = collaborationManager.get(
    `artifact:${props.artifactId}`,
    session,
  );
  const collectionConnection = collaborationManager.get(
    `artifactCollection:${props.collectionId}`,
    session,
  );

  return (
    <IonModal>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('artifact.settings')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={props.dismiss}>
              <IonIcon slot="icon-only" icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ArtifactSharingEditor
          collectionYDoc={collectionConnection.yjsDoc}
          artifactId={props.artifactId}
        />
      </IonContent>
      <IonFooter>
        <IonButton expand="block" onClick={props.dismiss}>
          {t('generic.done')}
        </IonButton>
      </IonFooter>
    </IonModal>
  );
};
