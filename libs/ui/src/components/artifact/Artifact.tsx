import { ArtifactDTO } from '@feynote/prisma/types';
import { IonContent, IonPage, useIonToast } from '@ionic/react';
import { trpc } from '../../utils/trpc';
import { handleTRPCErrors } from '../../utils/handleTRPCErrors';
import { useContext, useEffect, useState } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { useProgressBar } from '../../utils/useProgressBar';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactContextMenu } from './ArtifactContextMenu';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { ArtifactRightSidemenu } from './ArtifactRightSidemenu';
import { PaneContext } from '../../context/pane/PaneContext';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import { EventData } from '../../context/events/EventData';
import { navigate } from 'ionicons/icons';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';

const BottomSpacer = styled.div`
  height: 100px;
`;

interface ArtifactProps {
  id: string;
  focusBlockId?: string;
  focusDate?: string;
}

export const Artifact: React.FC<ArtifactProps> = (props) => {
  const [presentToast] = useIonToast();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const [title, setTitle] = useState('');
  const { navigate, isPaneFocused } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);

  const load = async () => {
    await trpc.artifact.getArtifactById
      .query({
        id: props.id,
      })
      .then((_artifact) => {
        setArtifact(_artifact);
        setTitle(_artifact.title);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  const loadWithProgress = async () => {
    const progress = startProgressBar();
    return load().finally(() => progress.dismiss());
  };

  useEffect(() => {
    loadWithProgress();
  }, []);

  useEffect(() => {
    const updateHandler = (
      _: EventName,
      data: EventData[EventName.ArtifactUpdated],
    ) => {
      if (data.artifactId === props.id) {
        load();
      }
    };
    eventManager.addEventListener(EventName.ArtifactUpdated, updateHandler);

    const deleteHandler = (
      _: EventName,
      data: EventData[EventName.ArtifactDeleted],
    ) => {
      if (data.artifactId === props.id) {
        navigate(PaneableComponent.Dashboard, {}, PaneTransition.Reset);
      }
    };
    eventManager.addEventListener(EventName.ArtifactDeleted, deleteHandler);

    return () => {
      eventManager.removeEventListener(
        EventName.ArtifactUpdated,
        updateHandler,
      );
      eventManager.removeEventListener(
        EventName.ArtifactDeleted,
        deleteHandler,
      );
    };
  }, [props.id]);

  const onTitleChange = (updatedTitle: string) => {
    setTitle(updatedTitle);
  };

  return (
    <IonPage>
      <PaneNav
        title={title}
        popoverContents={<ArtifactContextMenu artifactId={props.id} />}
      />
      <IonContent className="ion-padding-start ion-padding-end">
        {ProgressBar}
        {artifact && (
          <ArtifactRenderer
            artifact={artifact}
            scrollToBlockId={props.focusBlockId}
            scrollToDate={props.focusDate}
            onTitleChange={onTitleChange}
          />
        )}
        <BottomSpacer />
      </IonContent>
      {artifact &&
        isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(
          <ArtifactRightSidemenu
            key={artifact.id}
            artifact={artifact}
            reload={load}
          />,
          sidemenuContentRef.current,
        )}
    </IonPage>
  );
};
