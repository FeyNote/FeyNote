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
  useIonRouter,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { options } from 'ionicons/icons';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useMemo, useRef, useState } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { RouteArgs } from '../../routes';
import { useParams } from 'react-router-dom';
import { t } from 'i18next';
import { ArtifactDeleteButton } from './ArtifactDeleteButton';
import { useProgressBar } from '../../../utils/useProgressBar';

export const Artifact: React.FC = () => {
  const { id } = useParams<RouteArgs['artifact']>();
  const [presentToast] = useIonToast();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const router = useIonRouter();
  const searchParams = useMemo(
    () => new URLSearchParams(router.routeInfo.search),
    [router.routeInfo.search],
  );

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>
            {t('artifact.title')}: TODO: Merge this and ArtifactRenderer
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
        <ArtifactRenderer
          artifactId={id}
          scrollToBlockId={searchParams.get('blockId') || undefined}
        />
      </IonContent>
      <IonPopover trigger="artifact-popover-trigger" triggerAction="click">
        <IonContent class="ion-padding">
          <ArtifactDeleteButton artifactId={id} />
        </IonContent>
      </IonPopover>
    </IonPage>
  );
};
