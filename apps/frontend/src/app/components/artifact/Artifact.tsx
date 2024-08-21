import { ArtifactDTO } from '@feynote/prisma/types';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonPopover,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { options, add, documentText, calendar } from 'ionicons/icons';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { RouteArgs, routes } from '../../routes';
import { useParams } from 'react-router-dom';
import { t } from 'i18next';
import { useProgressBar } from '../../../utils/useProgressBar';
import type { ArtifactType } from '@prisma/client';
import { EventName } from '../../context/events/EventName';
import { EventContext } from '../../context/events/EventContext';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactContextMenu } from './ArtifactContextMenu';

interface Props {
  id: string;
}

export const Artifact: React.FC<Props> = (props) => {
  // const { id } = useParams<RouteArgs['artifact']>();
  const [presentToast] = useIonToast();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const { eventManager } = useContext(EventContext);
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const router = useIonRouter();
  const searchParams = useMemo(
    () => new URLSearchParams(router.routeInfo.search),
    [router.routeInfo.search],
  );

  const load = () => {
    const progress = startProgressBar();
    trpc.artifact.getArtifactById
      .query({
        id: props.id,
      })
      .then((_artifact) => {
        setArtifact(_artifact);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        progress.dismiss();
      });
  };

  useEffect(() => {
    load();
  }, []);

  const newArtifact = async (type: ArtifactType) => {
    const artifact = await trpc.artifact.createArtifact.mutate({
      title: 'Untitled',
      type,
      theme: 'default',
      isPinned: false,
      isTemplate: false,
      text: '',
      json: {},
      rootTemplateId: null,
      artifactTemplateId: null,
    });

    router.push(routes.artifact.build({ id: artifact.id }), 'forward');

    eventManager.broadcast([EventName.ArtifactCreated]);
  };

  return (
    <IonPage>
      <PaneNav
        title={artifact?.title || ''}
        popoverContents={<ArtifactContextMenu artifactId={props.id} />}
      />
      <IonContent className="ion-padding">
        {ProgressBar}
        {artifact && (
          <ArtifactRenderer
            artifact={artifact}
            reload={load}
            scrollToBlockId={searchParams.get('blockId') || undefined}
            scrollToDate={searchParams.get('date') || undefined}
          />
        )}
      </IonContent>
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton>
          <IonIcon icon={add} />
        </IonFabButton>
        <IonFabList side="top">
          <IonFabButton onClick={() => newArtifact('tiptap')}>
            <IonIcon icon={documentText}></IonIcon>
          </IonFabButton>
          <IonFabButton onClick={() => newArtifact('calendar')}>
            <IonIcon icon={calendar}></IonIcon>
          </IonFabButton>
        </IonFabList>
      </IonFab>
    </IonPage>
  );
};
