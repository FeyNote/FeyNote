import { PaneTransition } from '../../../../context/globalPane/GlobalPaneContext';
import { useContext, useRef } from 'react';
import { PaneContext } from '../../../../context/pane/PaneContext';
import { PaneableComponent } from '../../../../context/globalPane/PaneableComponent';
import { CompactIonItem } from '../../../CompactIonItem';
import { NowrapIonLabel } from '../../../NowrapIonLabel';
import { useArtifactPreviewTimer } from '../../../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { ArtifactReferencePreview } from '../../../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';
import { useTranslation } from 'react-i18next';
import type { Edge } from '@feynote/shared-utils';
import { useContextMenu } from '../../../../utils/contextMenu/useContextMenu';
import { ArtifactRightSidemenuReferenceContextMenu } from '../ArtifactRightSidemenuReferenceContextMenu';

interface Props {
  edge: Edge;
}

export const IncomingReferenceItem: React.FC<Props> = (props) => {
  const { pane, navigate } = useContext(PaneContext);
  const { t } = useTranslation();
  const ref = useRef<HTMLIonItemElement>(null);

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(props.edge.artifactId, props.edge.isBroken);

  const linkClicked = (
    event: React.MouseEvent<
      HTMLAnchorElement | HTMLDivElement | HTMLIonItemElement
    >,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    let paneTransition = PaneTransition.Push;
    if (event.metaKey || event.ctrlKey) {
      paneTransition = PaneTransition.NewTab;
    }
    navigate(
      PaneableComponent.Artifact,
      {
        id: props.edge.artifactId,
        focusBlockId: props.edge.artifactBlockId,
      },
      paneTransition,
      !(event.metaKey || event.ctrlKey),
    );
  };

  const { onContextMenu } = useContextMenu(
    ArtifactRightSidemenuReferenceContextMenu,
    {
      paneId: pane.id,
      currentArtifactId: props.edge.targetArtifactId,
      edge: props.edge,
      navigate,
    },
  );

  const title = props.edge.targetArtifactBlockId
    ? t('artifactRightSideMenu.incoming.referencesText')
    : t('artifactRightSideMenu.incoming.referencesArtifact');

  return (
    <CompactIonItem
      ref={ref}
      lines="none"
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onClick={linkClicked}
      onContextMenu={(event) => (onContextMenu(event), close())}
      button
    >
      <NowrapIonLabel>
        {title}
        {props.edge.targetArtifactBlockId && <p>{props.edge.referenceText}</p>}
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
  );
};
