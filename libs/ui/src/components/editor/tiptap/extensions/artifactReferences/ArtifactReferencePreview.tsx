import { ArtifactDTO } from '@feynote/global-types';
import styled from 'styled-components';
import { useEffect, useMemo, useRef } from 'react';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { BoundedFloatingWindow } from '../../../../BoundedFloatingWindow';
import { getEdgeId, getMetaFromYArtifact } from '@feynote/shared-utils';
import { TiptapPreview } from '../../../TiptapPreview';
import { ArtifactCalendar } from '../../../../calendar/ArtifactCalendar';
import { useScrollBlockIntoView } from '../../../useScrollBlockIntoView';
import { useScrollDateIntoView } from '../../../../calendar/useScrollDateIntoView';
import { useEdgesForArtifactId } from '../../../../../utils/edgesReferences/useEdgesForArtifactId';
import { getEdgeStore } from '../../../../../utils/edgesReferences/edgeStore';

const PREVIEW_WIDTH_PX = 600;
const PREVIEW_MIN_HEIGHT_PX = 100;
const PREVIEW_MAX_HEIGHT_PX = 300;

const StyledBoundedFloatingWindow = styled(BoundedFloatingWindow)`
  overflow-y: auto;
  background: var(--ion-background-color, #ffffff);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.3);
  padding: 10px;
`;

const Header = styled.h4`
  margin-top: 8px;
  margin-bottom: 16px;
`;

interface Props {
  artifact: ArtifactDTO;
  artifactYBin: Uint8Array;
  artifactBlockId?: string;
  artifactDate?: string;
  previewTarget: HTMLElement;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const ArtifactReferencePreview: React.FC<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const yDoc = useMemo(() => {
    const yDoc = new YDoc();

    applyUpdate(yDoc, props.artifactYBin);

    return yDoc;
  }, [props.artifact]);

  const artifactMeta = getMetaFromYArtifact(yDoc);

  useEffect(() => {
    getEdgeStore().provideStaticEdgesForArtifactId({
      artifactId: props.artifact.id,
      outgoingEdges: props.artifact.artifactReferences.map((ref) => ({
        ...ref,
        id: getEdgeId(ref),
        isBroken: !ref.referenceTargetArtifactId,
        artifactTitle: ref.artifact.title,
      })),
      incomingEdges: props.artifact.incomingArtifactReferences.map((ref) => ({
        ...ref,
        id: getEdgeId(ref),
        isBroken: !ref.referenceTargetArtifactId,
        artifactTitle: ref.artifact.title,
      })),
    });
  }, [props.artifact]);

  const { incomingEdges } = useEdgesForArtifactId(props.artifact.id);

  useScrollBlockIntoView(props.artifactBlockId, [], containerRef);
  useScrollDateIntoView(props.artifactDate, [], containerRef);

  return (
    <StyledBoundedFloatingWindow
      ref={containerRef}
      floatTarget={props.previewTarget}
      width={PREVIEW_WIDTH_PX}
      minHeight={PREVIEW_MIN_HEIGHT_PX}
      maxHeight={PREVIEW_MAX_HEIGHT_PX}
      onClick={(event) => props.onClick?.(event)}
    >
      <Header>{props.artifact.title}</Header>
      {artifactMeta.type === 'tiptap' && (
        <TiptapPreview
          artifactId={props.artifact.id}
          yDoc={yDoc}
          previewText={props.artifact.previewText}
        />
      )}
      {artifactMeta.type === 'calendar' && (
        <ArtifactCalendar
          artifactId={props.artifact.id}
          y={yDoc}
          centerDate={props.artifactDate}
          editable={false}
          viewType="fullsize"
        />
      )}
    </StyledBoundedFloatingWindow>
  );
};
