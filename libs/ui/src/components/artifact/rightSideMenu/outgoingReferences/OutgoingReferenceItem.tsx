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

export const OutgoingReferenceItem: React.FC<Props> = (props) => {
  const { pane } = usePaneContext();
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(props.edge.targetArtifactId);

  const linkClicked = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
      id: props.edge.targetArtifactId,
      focusBlockId: props.edge.targetArtifactBlockId || undefined,
      focusDate: props.edge.targetArtifactDate || undefined,
    });
  };

  const blockReferenceContent = (
    <SidemenuCardItemLabel>
      {t('artifactRightSideMenu.outgoing.block', {
        text: props.edge.referenceText,
      })}
      <SidemenuCardItemSublabel>
        {t('artifactRightSideMenu.outgoing.block.subtitle', {
          title: props.edge.targetArtifactTitle,
        })}
      </SidemenuCardItemSublabel>
    </SidemenuCardItemLabel>
  );

  const artifactReferenceContent = (
    <SidemenuCardItemLabel>
      {t('artifactRightSideMenu.outgoing.artifact')}
      <SidemenuCardItemSublabel>
        {t('artifactRightSideMenu.outgoing.artifact.subtitle', {
          title: props.edge.targetArtifactTitle,
        })}
      </SidemenuCardItemSublabel>
    </SidemenuCardItemLabel>
  );

  const content = props.edge.targetArtifactBlockId
    ? blockReferenceContent
    : artifactReferenceContent;

  return (
    <ArtifactRightSidemenuReferenceContextMenu
      paneId={pane.id}
      currentArtifactId={props.edge.artifactId}
      edge={props.edge}
    >
      <SidemenuCardItem
        data-edge-targetArtifactId={props.edge.targetArtifactId}
        ref={ref}
        $isButton
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={linkClicked}
      >
        {content}
        {previewInfo && ref.current && (
          <ArtifactReferencePreview
            onClick={(event) => (
              event.stopPropagation(),
              linkClicked(event),
              close()
            )}
            artifactId={props.edge.targetArtifactId}
            previewInfo={previewInfo}
            referenceText={props.edge.referenceText}
            artifactBlockId={props.edge.targetArtifactBlockId || undefined}
            artifactDate={props.edge.targetArtifactDate || undefined}
            previewTarget={ref.current}
          />
        )}
      </SidemenuCardItem>
    </ArtifactRightSidemenuReferenceContextMenu>
  );
};
