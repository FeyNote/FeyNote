import { ArtifactDTO } from '@feynote/prisma/types';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonPage,
  useIonToast,
} from '@ionic/react';
import { add, documentText, calendar } from 'ionicons/icons';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useContext, useEffect, useState } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { useProgressBar } from '../../../utils/useProgressBar';
import type { ArtifactType } from '@prisma/client';
import { EventName } from '../../context/events/EventName';
import { EventContext } from '../../context/events/EventContext';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactContextMenu } from './ArtifactContextMenu';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';

interface Props {
  id: string;
  focusBlockId?: string;
  focusDate?: string;
}

export const Artifact: React.FC<Props> = (props) => {
  const [presentToast] = useIonToast();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const { eventManager } = useContext(EventContext);
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const { navigate } = useContext(PaneContext);

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

    navigate(<Artifact id={artifact.id} />, PaneTransition.Push);

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
            scrollToBlockId={props.focusBlockId}
            scrollToDate={props.focusDate}
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
