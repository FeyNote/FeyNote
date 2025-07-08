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
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { useArtifactDelete } from './useArtifactDelete';
import { useIsEditable } from '../../utils/useAuthorizedScope';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import type { TypedMap } from 'yjs-types';
import type { YArtifactMeta } from '@feynote/global-types';

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
  const { deleteArtifact } = useArtifactDelete();
  const { isEditable } = useIsEditable(connection);

  const undelete = () => {
    if (isEditable) {
      const yDoc = connection.yjsDoc;
      yDoc.transact(() => {
        (
          yDoc.getMap(ARTIFACT_META_KEY) as TypedMap<Partial<YArtifactMeta>>
        ).set('deletedAt', null);
      });
    }
  };

  return (
    <IonPage>
      <PaneNav
        title={title || ''}
        popoverContents={
          <ArtifactContextMenu
            artifactId={props.id}
            isEditable={isEditable}
            triggerDelete={() => deleteArtifact(props.id)}
            triggerUndelete={undelete}
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
          isEditable={isEditable}
          scrollToBlockId={props.focusBlockId}
          scrollToDate={props.focusDate}
          onTocUpdate={(content) => {
            onTocUpdateRef.current?.(content);
          }}
          undelete={() => undelete()}
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
