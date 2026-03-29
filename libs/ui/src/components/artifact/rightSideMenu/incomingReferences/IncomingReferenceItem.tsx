import { useRef } from 'react';
import { usePaneContext } from '../../../../context/pane/PaneContext';
import { PaneableComponent } from '../../../../context/globalPane/PaneableComponent';
import { useArtifactPreviewTimer } from '../../../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { ArtifactReferencePreview } from '../../../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';
import { useTranslation } from 'react-i18next';
import type { Edge } from '@feynote/shared-utils';
import { ArtifactRightSidemenuReferenceContextMenu } from '../ArtifactRightSidemenuReferenceContextMenu';
import { useNavigateWithKeyboardHandler } from '../../../../utils/useNavigateWithKeyboardHandler';
import {
  SidemenuCardItem,
  SidemenuCardItemLabel,
  SidemenuCardItemSublabel,
} from '../../../sidemenu/SidemenuComponents';

interface Props {
  edge: Edge;
}

export const IncomingReferenceItem: React.FC<Props> = (props) => {
  const { pane } = usePaneContext();
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(props.edge.artifactId);

  const linkClicked = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
      id: props.edge.artifactId,
      focusBlockId: props.edge.artifactBlockId,
    });
  };

  const title = props.edge.targetArtifactBlockId
    ? t('artifactRightSideMenu.incoming.referencesText')
    : t('artifactRightSideMenu.incoming.referencesArtifact');

  return (
    <ArtifactRightSidemenuReferenceContextMenu
      paneId={pane.id}
      currentArtifactId={props.edge.targetArtifactId}
      edge={props.edge}
    >
      <SidemenuCardItem
        data-edge-artifactId={props.edge.artifactId}
        ref={ref}
        $isButton
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={linkClicked}
      >
        <SidemenuCardItemLabel>
          {title}
          {props.edge.targetArtifactBlockId && (
            <SidemenuCardItemSublabel>
              {props.edge.referenceText}
            </SidemenuCardItemSublabel>
          )}
        </SidemenuCardItemLabel>
        {previewInfo && ref.current && (
          <ArtifactReferencePreview
            onClick={(event) => (
              event.stopPropagation(),
              linkClicked(event),
              close()
            )}
            artifactId={props.edge.artifactId}
            previewInfo={previewInfo}
            referenceText={props.edge.referenceText}
            artifactBlockId={props.edge.artifactBlockId}
            artifactDate={undefined}
            previewTarget={ref.current}
          />
        )}
      </SidemenuCardItem>
    </ArtifactRightSidemenuReferenceContextMenu>
  );
};
