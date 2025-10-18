import { useRef } from 'react';
import { usePaneContext } from '../../../../context/pane/PaneContext';
import { PaneableComponent } from '../../../../context/globalPane/PaneableComponent';
import { CompactIonItem } from '../../../CompactIonItem';
import { NowrapIonLabel } from '../../../NowrapIonLabel';
import { useArtifactPreviewTimer } from '../../../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { ArtifactReferencePreview } from '../../../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';
import { useTranslation } from 'react-i18next';
import type { Edge } from '@feynote/shared-utils';
import { ArtifactRightSidemenuReferenceContextMenu } from '../ArtifactRightSidemenuReferenceContextMenu';
import { useNavigateWithKeyboardHandler } from '../../../../utils/useNavigateWithKeyboardHandler';

interface Props {
  edge: Edge;
}

export const IncomingReferenceItem: React.FC<Props> = (props) => {
  const { pane } = usePaneContext();
  const { t } = useTranslation();
  const ref = useRef<HTMLIonItemElement>(null);
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler(true);

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(props.edge.artifactId);

  const linkClicked = (
    event: React.MouseEvent<
      HTMLAnchorElement | HTMLDivElement | HTMLIonItemElement
    >,
  ) => {
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
      <CompactIonItem
        ref={ref}
        lines="none"
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={linkClicked}
        button
      >
        <NowrapIonLabel>
          {title}
          {props.edge.targetArtifactBlockId && (
            <p>{props.edge.referenceText}</p>
          )}
        </NowrapIonLabel>
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
      </CompactIonItem>
    </ArtifactRightSidemenuReferenceContextMenu>
  );
};
