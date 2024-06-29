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
  const [artifact, setArtifact] = useState<ArtifactDetail>();
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
