import { IonContent, IonPage } from '@ionic/react';
import { useContext, useEffect } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactContextMenu } from './ArtifactContextMenu';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { ArtifactRightSidemenu } from './rightSideMenu/ArtifactRightSidemenu';
import { PaneContext } from '../../context/pane/PaneContext';
import { createPortal } from 'react-dom';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import { EventData } from '../../context/events/EventData';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { collaborationManager } from '../editor/collaborationManager';
import { SessionContext } from '../../context/session/SessionContext';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';

interface ArtifactProps {
  id: string;
  focusBlockId?: string;
  focusDate?: string;
}

export const Artifact: React.FC<ArtifactProps> = (props) => {
  const { session } = useContext(SessionContext);
  const { pane, navigate, isPaneFocused } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);

  const connection = collaborationManager.get(`artifact:${props.id}`, session);
  const { title } = useObserveYArtifactMeta(connection.yjsDoc);

  useEffect(() => {
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
        EventName.ArtifactDeleted,
        deleteHandler,
      );
    };
  }, [props.id]);

  return (
    <IonPage>
      <PaneNav
        title={title || ''}
        popoverContents={
          <ArtifactContextMenu
            artifactId={props.id}
            connection={connection}
            pane={pane}
            navigate={navigate}
          />
        }
      />
      <IonContent
        className="ion-padding-start ion-padding-end"
        style={{ position: 'relative' }}
      >
        <ArtifactRenderer
          artifactId={props.id}
          connection={connection}
          scrollToBlockId={props.focusBlockId}
          scrollToDate={props.focusDate}
        />
      </IonContent>
      {isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(
          <ArtifactRightSidemenu
            artifactId={props.id}
            connection={connection}
            key={props.id}
          />,
          sidemenuContentRef.current,
        )}
    </IonPage>
  );
};
