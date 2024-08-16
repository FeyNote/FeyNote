import { ArtifactDTO } from '@feynote/prisma/types';
import styled from 'styled-components';
import { useMemo } from 'react';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { BoundedFloatingWindow } from '../../../../BoundedFloatingWindow';
import { getMetaFromYArtifact } from '@feynote/shared-utils';
import { TiptapPreview } from '../../../TiptapPreview';
import { ArtifactCalendar } from '../../../../calendar/ArtifactCalendar';
import { useScrollBlockIntoView } from '../../../useScrollBlockIntoView';
import { useScrollDateIntoView } from '../../../../calendar/useScrollDateIntoView';

const PREVIEW_WIDTH_PX = 600;
const PREVIEW_MIN_HEIGHT_PX = 100;
const PREVIEW_MAX_HEIGHT_PX = 300;

const StyledBoundedFloatingWindow = styled(BoundedFloatingWindow)`
  overflow-y: auto;
  background: var(--ion-background-color);
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
  onClick?: () => void;
}

export const ArtifactReferencePreview: React.FC<Props> = (props) => {
  const yDoc = useMemo(() => {
    const yDoc = new YDoc();

    applyUpdate(yDoc, props.artifactYBin);

    return yDoc;
  }, [props.artifact]);

  const artifactMeta = getMetaFromYArtifact(yDoc);

  useScrollBlockIntoView(props.artifactBlockId, []);
  useScrollDateIntoView(props.artifactDate, []);

  return (
    <StyledBoundedFloatingWindow
      floatTarget={props.previewTarget}
      width={PREVIEW_WIDTH_PX}
      minHeight={PREVIEW_MIN_HEIGHT_PX}
      maxHeight={PREVIEW_MAX_HEIGHT_PX}
      onClick={() => props.onClick?.()}
    >
      <Header>{props.artifact.title}</Header>
      {artifactMeta.type === 'tiptap' && (
        <TiptapPreview yDoc={yDoc} previewText={props.artifact.previewText} />
      )}
      {artifactMeta.type === 'calendar' && (
        <ArtifactCalendar
          y={yDoc}
          knownReferences={new Map()}
          incomingArtifactReferences={props.artifact.incomingArtifactReferences}
          centerDate={props.artifactDate}
          editable={false}
          viewType="fullsize"
        />
      )}
    </StyledBoundedFloatingWindow>
  );
};
