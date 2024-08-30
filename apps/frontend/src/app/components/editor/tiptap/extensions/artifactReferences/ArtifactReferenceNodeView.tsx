import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { getKnownArtifactReferenceKey } from './getKnownArtifactReferenceKey';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import type { ReferencePluginOptions } from './ArtifactReferencesExtension';
import { useArtifactPreviewTimer } from './useArtifactPreviewTimer';
import { useContext, useRef } from 'react';
import { ArtifactReferencePreview } from './ArtifactReferencePreview';
import styled from 'styled-components';
import { PaneContext } from '../../../../../context/pane/PaneContext';
import { PaneTransition } from '../../../../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../../../../context/globalPane/PaneableComponent';

const StyledNodeViewWrapper = styled(NodeViewWrapper)`
  display: inline;
`;

export const ArtifactReferenceNodeView = (props: NodeViewProps) => {
  const { navigate } = useContext(PaneContext);

  const { artifactId, artifactBlockId, artifactDate } = props.node.attrs;

  const key = getKnownArtifactReferenceKey(
    artifactId,
    artifactBlockId || undefined,
    artifactDate || undefined,
  );
  const ref = useRef<HTMLSpanElement>(null);

  const options = props.extension.options as ReferencePluginOptions;
  const knownReference = options.knownReferences.get(key);

  const linkClicked = () => {
    if (knownReference?.isBroken) return;

    navigate(
      PaneableComponent.Artifact,
      {
        id: props.node.attrs.artifactId,
        focusBlockId: artifactBlockId || undefined,
        focusDate: artifactDate || undefined,
      },
      PaneTransition.Push,
    );
  };

  const {
    artifact,
    artifactYBin,
    showPreview,
    onMouseOver,
    onMouseOut,
    close,
  } = useArtifactPreviewTimer(
    props.node.attrs.artifactId,
    knownReference?.isBroken ?? false,
  );

  let referenceText =
    knownReference?.referenceText || props.node.attrs.referenceText;
  if (props.node.attrs.artifactDate) {
    referenceText += ` ${props.node.attrs.artifactDate}`;
  }

  return (
    <StyledNodeViewWrapper>
      <ArtifactReferenceSpan
        ref={ref}
        $isBroken={false}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        <a onClick={() => (linkClicked(), close())}>{referenceText}</a>
        {showPreview && artifact && artifactYBin && ref.current && (
          <ArtifactReferencePreview
            onClick={() => (linkClicked(), close())}
            artifact={artifact}
            artifactYBin={artifactYBin}
            artifactBlockId={props.node.attrs.artifactBlockId || undefined}
            artifactDate={props.node.attrs.artifactDate || undefined}
            previewTarget={ref.current}
          />
        )}
      </ArtifactReferenceSpan>
    </StyledNodeViewWrapper>
  );
};
