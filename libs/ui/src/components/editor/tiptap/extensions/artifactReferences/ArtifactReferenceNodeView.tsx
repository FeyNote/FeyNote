import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { useArtifactPreviewTimer } from './useArtifactPreviewTimer';
import { useContext, useRef } from 'react';
import { ArtifactReferencePreview } from './ArtifactReferencePreview';
import styled from 'styled-components';
import { PaneContext } from '../../../../../context/pane/PaneContext';
import { PaneTransition } from '../../../../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../../../../context/globalPane/PaneableComponent';
import { useEdgesForArtifactId } from '../../../../../utils/edgesReferences/useEdgesForArtifactId';

const StyledNodeViewWrapper = styled(NodeViewWrapper)`
  display: inline;
`;

export const ArtifactReferenceNodeView = (props: NodeViewProps) => {
  const {
    artifactId: targetArtifactId,
    artifactBlockId: targetArtifactBlockId,
    artifactDate: targetArtifactDate,
  } = props.node.attrs;
  const artifactBlockId = props.node.attrs.id;
  const { artifactId } = props.extension.options;

  const { navigate } = useContext(PaneContext);
  const { getEdge } = useEdgesForArtifactId(artifactId);
  const edge = getEdge({
    artifactId,
    artifactBlockId,
    targetArtifactId,
    targetArtifactBlockId,
    targetArtifactDate,
  });
  const isBroken = edge ? edge.isBroken : false;

  const ref = useRef<HTMLSpanElement>(null);

  const linkClicked = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
  ) => {
    if (isBroken) return;

    let paneTransition = PaneTransition.Push;
    if (event.metaKey || event.ctrlKey) {
      paneTransition = PaneTransition.NewTab;
    }
    navigate(
      PaneableComponent.Artifact,
      {
        id: targetArtifactId,
        focusBlockId: targetArtifactBlockId || undefined,
        focusDate: targetArtifactDate || undefined,
      },
      paneTransition,
      !(event.metaKey || event.ctrlKey),
    );
  };

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(targetArtifactId, edge?.isBroken ?? false);

  let referenceText = edge?.referenceText || props.node.attrs.referenceText;
  if (targetArtifactDate) {
    referenceText += ` ${targetArtifactDate}`;
  }

  return (
    <StyledNodeViewWrapper>
      <ArtifactReferenceSpan
        ref={ref}
        $isBroken={isBroken}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        <a
          href=""
          onClick={(event) => (
            event.preventDefault(),
            event.stopPropagation(),
            linkClicked(event),
            close()
          )}
        >
          {referenceText}
        </a>
        {previewInfo && ref.current && (
          <ArtifactReferencePreview
            onClick={(event) => (
              event.stopPropagation(), linkClicked(event), close()
            )}
            artifactId={artifactId}
            previewInfo={previewInfo}
            referenceText={referenceText}
            artifactBlockId={targetArtifactBlockId || undefined}
            artifactDate={targetArtifactDate || undefined}
            previewTarget={ref.current}
          />
        )}
      </ArtifactReferenceSpan>
    </StyledNodeViewWrapper>
  );
};
