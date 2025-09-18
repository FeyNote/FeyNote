import type { Edge } from '@feynote/shared-utils';
import styled from 'styled-components';
import { TextForBlock } from '../TextForBlock';
import { useRef } from 'react';
import { useArtifactPreviewTimer } from '../tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { ArtifactReferencePreview } from '../tiptap/extensions/artifactReferences/ArtifactReferencePreview';

const Container = styled.div`
  background: var(--ion-card-background);

  box-shadow: 1px 1px 7px 0px rgba(0, 0, 0, 0.1);

  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 0;
  margin-right: 0;

  padding-left: 10px;
  padding-top: 8px;
  padding-bottom: 1px;
  cursor: pointer;
`;

const Heading = styled.h2`
  font-size: 1.1rem;
  margin: 0;
  margin-top: 8px;
  margin-bottom: 8px;
  padding: 0;
`;

interface Props {
  edge: Edge;
  open: (
    event: React.MouseEvent<HTMLElement>,
    artifactId: string,
    artifactBlockId: string,
  ) => void;
}

export const IncomingBlockReferenceInlinePreviewItem: React.FC<Props> = (
  props,
) => {
  const ref = useRef<HTMLDivElement>(null);
  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(
      props.edge.artifactId,
      props.edge.targetArtifactDeleted,
    );

  return (
    <Container
      ref={ref}
      onClick={(event) =>
        props.open(event, props.edge.artifactId, props.edge.artifactBlockId)
      }
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <Heading>{props.edge.artifactTitle}</Heading>

      <p>
        <TextForBlock
          artifactId={props.edge.artifactId}
          blockId={props.edge.artifactBlockId}
        />
      </p>
      {previewInfo && ref.current && (
        <ArtifactReferencePreview
          onClick={(event) => (
            event.stopPropagation(),
            props.open(
              event,
              props.edge.artifactId,
              props.edge.artifactBlockId,
            ),
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
    </Container>
  );
};
