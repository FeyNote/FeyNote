import { ArtifactDetail } from '@feynote/prisma/types';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonPopover,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { options } from 'ionicons/icons';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useRef, useState } from 'react';
import { ArtifactRenderer, EditArtifactDetail } from './ArtifactRenderer';
import { RouteArgs } from '../../routes';
import { useParams } from 'react-router-dom';
import { t } from 'i18next';
import { ArtifactDeleteButton } from './ArtifactDeleteButton';
import { isArtifactModified } from './isArtifactSaved';

/**
 * Used to delay after user stops typing to initate a save
 */
const AUTOSAVE_TIMEOUT = 2000;

export const Artifact: React.FC = () => {
  const { id } = useParams<RouteArgs['artifact']>();
  const [presentToast] = useIonToast();
  const [artifact, setArtifact] = useState<ArtifactDetail>();
  const saveTimeout = useRef<NodeJS.Timeout>();
  const savingRef = useRef<boolean>(false);

  const load = () => {
    trpc.artifact.getArtifactById
      .query({
        id,
      })
      .then((_artifact) => {
        setArtifact(_artifact);
        savingRef.current = false;
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  useIonViewWillEnter(() => {
    load();
  });

  const save = (updatedArtifact: EditArtifactDetail) => {
    if (!artifact) return;

    trpc.artifact.updateArtifact
      .mutate({
        id: artifact.id,
        title: updatedArtifact.title,
        json: updatedArtifact.json,
        text: updatedArtifact.text,
        isPinned: updatedArtifact.isPinned,
        isTemplate: updatedArtifact.isTemplate,
        rootTemplateId: updatedArtifact.rootTemplateId,
        artifactTemplateId: updatedArtifact.artifactTemplate?.id || null,
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        load();
      });
  };

  const onChange = (updatedArtifact: EditArtifactDetail) => {
    if (!artifact) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      if (savingRef.current) return onChange(updatedArtifact);
      if (!isArtifactModified(artifact, updatedArtifact)) return;
      save(updatedArtifact);
    }, AUTOSAVE_TIMEOUT);
  };

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>
            {t('artifact.title')}: {artifact?.title}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton id="artifact-popover-trigger">
              <IonIcon slot="icon-only" icon={options} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {artifact && (
          <ArtifactRenderer
            artifact={artifact}
            save={save}
            onArtifactChanged={onChange}
          />
        )}
      </IonContent>
      <IonPopover trigger="artifact-popover-trigger" triggerAction="click">
        <IonContent class="ion-padding">
          {artifact && <ArtifactDeleteButton artifactId={artifact.id} />}
        </IonContent>
      </IonPopover>
    </IonPage>
  );
};
