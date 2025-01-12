import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { useContext, useRef } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { CompactIonItem } from '../CompactIonItem';
import { NowrapIonLabel } from '../NowrapIonLabel';
import { useArtifactPreviewTimer } from '../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { ArtifactReferencePreview } from '../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';

interface Props {
  otherArtifactId: string;
  otherArtifactTitle: string;
}

export const ArtifactRightSidemenuReference: React.FC<Props> = (props) => {
  const { navigate } = useContext(PaneContext);
  const ref = useRef<HTMLIonItemElement>(null);

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(props.otherArtifactId, false);

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
        id: props.otherArtifactId,
      },
      paneTransition,
      !(event.metaKey || event.ctrlKey),
    );
  };

  return (
    <CompactIonItem
      ref={ref}
      lines="none"
      key={props.otherArtifactId}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onClick={linkClicked}
      button
    >
      <NowrapIonLabel>{props.otherArtifactTitle}</NowrapIonLabel>
      {previewInfo && ref.current && (
        <ArtifactReferencePreview
          onClick={(event) => (
            event.stopPropagation(), linkClicked(event), close()
          )}
          artifactId={props.otherArtifactId}
          previewInfo={previewInfo}
          referenceText={props.otherArtifactTitle}
          artifactBlockId={undefined}
          artifactDate={undefined}
          previewTarget={ref.current}
        />
      )}
    </CompactIonItem>
  );
};
