import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { useArtifactPreviewTimer } from './useArtifactPreviewTimer';
import { useMemo, useRef } from 'react';
import { ArtifactReferencePreview } from './ArtifactReferencePreview';
import styled from 'styled-components';
import { PaneableComponent } from '../../../../../context/globalPane/PaneableComponent';
import { useEdgesForArtifactId } from '../../../../../utils/localDb/edges/useEdgesForArtifactId';
import { useNavigateWithKeyboardHandler } from '../../../../../utils/useNavigateWithKeyboardHandler';

const ArtifactReferenceLink = styled.a`
  cursor: pointer;
`;

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

  // This is impossible according to typings, but in reality it _can_ happen if we mess up
  // since this is all passed through Tiptap JSON along the way.
  // We want to break the nodeview rather than render a weird (and partially broken!) nodeview.
  if (!artifactId || !artifactBlockId || !targetArtifactId) {
    throw new Error(
      'ArtifactReferenceNodeView rendered without required property',
    );
  }

  const { getEdge } = useEdgesForArtifactId(artifactId);
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler(true);
  const edge = useMemo(
    () =>
      getEdge({
        artifactId,
        artifactBlockId,
        targetArtifactId,
        targetArtifactBlockId,
        targetArtifactDate,
      }),
    [getEdge],
  );

  const ref = useRef<HTMLSpanElement>(null);

  const linkClicked = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
  ) => {
    navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
      id: targetArtifactId,
      focusBlockId: targetArtifactBlockId || undefined,
      focusDate: targetArtifactDate || undefined,
    });
  };

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(targetArtifactId);

  let referenceText = edge?.referenceText || props.node.attrs.referenceText;
  if (targetArtifactDate) {
    referenceText += ` ${targetArtifactDate}`;
  }

  return (
    <StyledNodeViewWrapper>
      <ArtifactReferenceSpan
        ref={ref}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        <ArtifactReferenceLink
          data-id={props.node.attrs.id}
          data-target-artifact-id={targetArtifactId}
          data-target-artifact-block-id={targetArtifactBlockId}
          data-target-artifact-date={targetArtifactDate}
          onClick={(event) => (
            event.preventDefault(),
            event.stopPropagation(),
            linkClicked(event),
            close()
          )}
        >
          {referenceText}
        </ArtifactReferenceLink>
        {previewInfo && ref.current && (
          <ArtifactReferencePreview
            onClick={(event) => (
              event.stopPropagation(),
              linkClicked(event),
              close()
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
