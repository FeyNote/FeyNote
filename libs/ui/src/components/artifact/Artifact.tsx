import { IonContent, IonPage } from '@ionic/react';
import { useContext, useRef } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactContextMenu } from './ArtifactContextMenu';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { ArtifactRightSidemenu } from './rightSideMenu/ArtifactRightSidemenu';
import { PaneContext } from '../../context/pane/PaneContext';
import { createPortal } from 'react-dom';
import { collaborationManager } from '../editor/collaborationManager';
import { SessionContext } from '../../context/session/SessionContext';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import type { TableOfContentData } from '@tiptap-pro/extension-table-of-contents';

interface ArtifactProps {
  id: string;
  focusBlockId?: string;
  focusDate?: string;
}

export const Artifact: React.FC<ArtifactProps> = (props) => {
  const { session } = useContext(SessionContext);
  const { pane, navigate, isPaneFocused } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);
  // We use a ref instead of state because this method is called on every keystroke and we don't want
  // to re-render the component stack top to bottom
  const onTocUpdateRef =
    useRef<(content: TableOfContentData) => void>(undefined);

  const connection = collaborationManager.get(`artifact:${props.id}`, session);
  const { title } = useObserveYArtifactMeta(connection.yjsDoc);

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
          onTocUpdate={(content) => {
            onTocUpdateRef.current?.(content);
          }}
        />
      </IonContent>
      {isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(
          <ArtifactRightSidemenu
            artifactId={props.id}
            connection={connection}
            key={props.id}
            onTocUpdateRef={onTocUpdateRef}
          />,
          sidemenuContentRef.current,
        )}
    </IonPage>
  );
};
