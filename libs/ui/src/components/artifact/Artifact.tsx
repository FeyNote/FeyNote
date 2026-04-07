import {
  PaneContentContainer,
  PaneContent,
} from '../pane/PaneContentContainer';
import { useRef } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactDropdownMenu } from './ArtifactDropdownMenu';
import { useSidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { ArtifactRightSidemenu } from './rightSideMenu/ArtifactRightSidemenu';
import { usePaneContext } from '../../context/pane/PaneContext';
import { createPortal } from 'react-dom';
import { useObserveYArtifactMeta } from '../../utils/collaboration/useObserveYArtifactMeta';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { useCollaborationConnectionAuthorizationState } from '../../utils/collaboration/useCollaborationConnectionAuthorizationState';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import type { TypedMap } from 'yjs-types';
import type { YArtifactMeta } from '@feynote/global-types';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { CollaborationConnectionAuthorizationState } from '../../utils/collaboration/collaborationManager';
import { CollaborationGate } from '../collaboration/CollaborationGate';

interface ArtifactProps {
  id: string;
  focusBlockId?: string;
  focusDate?: string;
}

export const Artifact: React.FC<ArtifactProps> = (props) => {
  const { pane, navigate, isPaneFocused } = usePaneContext();
  const { sidemenuContentRef } = useSidemenuContext();
  // We use a ref instead of state because this method is called on every keystroke and we don't want
  // to re-render the component stack top to bottom
  const onTocUpdateRef =
    useRef<(content: TableOfContentData) => void>(undefined);

  const connection = useCollaborationConnection(`artifact:${props.id}`);

  const { title } = useObserveYArtifactMeta(connection.yjsDoc).meta;
  const { authorizationState } =
    useCollaborationConnectionAuthorizationState(connection);

  const undelete = () => {
    if (
      authorizationState === CollaborationConnectionAuthorizationState.CoOwner
    ) {
      connection.yjsDoc.transact(() => {
        (
          connection.yjsDoc.getMap(ARTIFACT_META_KEY) as TypedMap<
            Partial<YArtifactMeta>
          >
        ).set('deletedAt', null);
      });
    }
  };

  return (
    <PaneContentContainer data-id={props.id}>
      <PaneNav
        title={title || ''}
        renderDropdownMenu={(children) => (
          <ArtifactDropdownMenu
            artifactId={props.id}
            authorizationState={authorizationState}
            triggerUndelete={undelete}
            connection={connection}
            pane={pane}
            navigate={navigate}
          >
            {children}
          </ArtifactDropdownMenu>
        )}
      />
      <PaneContent>
        <CollaborationGate connection={connection}>
          <ArtifactRenderer
            artifactId={props.id}
            connection={connection}
            authorizationState={authorizationState}
            scrollToBlockId={props.focusBlockId}
            scrollToDate={props.focusDate}
            onTocUpdate={(content) => {
              onTocUpdateRef.current?.(content);
            }}
            undelete={() => undelete()}
          />
        </CollaborationGate>
      </PaneContent>
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
    </PaneContentContainer>
  );
};
