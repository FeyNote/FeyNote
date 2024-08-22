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
import { useContext, useMemo, useRef, useState } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { RouteArgs, routes } from '../../routes';
import { useParams } from 'react-router-dom';
import { t } from 'i18next';
import { ArtifactDeleteButton } from './ArtifactDeleteButton';
import { useProgressBar } from '../../../utils/useProgressBar';
import type { ArtifactType } from '@prisma/client';
import { EventName } from '../../context/events/EventName';
import { EventContext } from '../../context/events/EventContext';

export const Artifact: React.FC = () => {
  const { id } = useParams<RouteArgs['artifact']>();
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
        id,
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

  useIonViewWillEnter(() => {
    load();
  });

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
          {ProgressBar}
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {artifact && (
          <ArtifactRenderer
            artifact={artifact}
            reload={load}
            scrollToBlockId={searchParams.get('blockId') || undefined}
            scrollToDate={searchParams.get('date') || undefined}
          />
        )}
      </IonContent>
      <IonPopover trigger="artifact-popover-trigger" triggerAction="click">
        <IonContent class="ion-padding">
          {artifact && <ArtifactDeleteButton artifactId={artifact.id} />}
        </IonContent>
      </IonPopover>
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
