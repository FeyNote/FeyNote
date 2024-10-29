import { ArtifactDTO } from '@feynote/global-types';
import { IonContent, IonPage } from '@ionic/react';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useContext, useEffect, useState } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { useProgressBar } from '../../utils/useProgressBar';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactContextMenu } from './ArtifactContextMenu';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { ArtifactRightSidemenu } from './ArtifactRightSidemenu';
import { PaneContext } from '../../context/pane/PaneContext';
import { createPortal } from 'react-dom';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import { EventData } from '../../context/events/EventData';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { artifactCollaborationManager } from '../editor/artifactCollaborationManager';
import { SessionContext } from '../../context/session/SessionContext';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';

interface ArtifactProps {
  id: string;
  focusBlockId?: string;
  focusDate?: string;
}

export const Artifact: React.FC<ArtifactProps> = (props) => {
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const { session } = useContext(SessionContext);
  const { navigate, isPaneFocused } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const connection = artifactCollaborationManager.get(props.id, session);
  const { title } = useObserveYArtifactMeta(connection.yjsDoc);

  const load = async () => {
    await trpc.artifact.getArtifactById
      .query({
        id: props.id,
      })
      .then((_artifact) => {
        setArtifact(_artifact);
      })
      .catch((error) => {
        handleTRPCErrors(error);
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

  return (
    <IonPage>
      <PaneNav
        title={title || ''}
        popoverContents={<ArtifactContextMenu artifactId={props.id} />}
      />
      {ProgressBar}
      <IonContent
        className="ion-padding-start ion-padding-end"
        style={{ position: 'relative' }}
      >
        {artifact && (
          <ArtifactRenderer
            artifact={artifact}
            connection={connection}
            scrollToBlockId={props.focusBlockId}
            scrollToDate={props.focusDate}
          />
        )}
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
