import { useRef, useState } from 'react';
import { usePaneContext } from '../../../../context/pane/PaneContext';
import { PaneableComponent } from '../../../../context/globalPane/PaneableComponent';
import { useNavigateWithKeyboardHandler } from '../../../../utils/useNavigateWithKeyboardHandler';
import { useArtifactPreviewTimer } from '../../../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { ArtifactReferencePreview } from '../../../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';
import { useTranslation } from 'react-i18next';
import type { Edge } from '@feynote/shared-utils';
import { OutgoingReferenceItem } from './OutgoingReferenceItem';
import styled from 'styled-components';
import { ArtifactRightSidemenuReferenceContextMenu } from '../ArtifactRightSidemenuReferenceContextMenu';
import { IoChevronDown, IoChevronUp } from '../../../AppIcons';
import {
  SidemenuCardItem,
  SidemenuCardItemLabel,
  SidemenuCardItemSublabel,
  SidemenuCardItemEndSlot,
} from '../../../sidemenu/SidemenuComponents';

const ChildReferencesContainer = styled.div`
  margin-left: 16px;
`;

const ExpandButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--text-color-dim);

  &:hover {
    background: var(--gray-a3);
  }
`;

interface Props {
  edges: Edge[];
}

export const OutgoingReferencesToArtifact: React.FC<Props> = (props) => {
  const { pane } = usePaneContext();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const edge0 = props.edges.at(0);
  if (!edge0) {
    throw new Error(
      'OutgoingReferencesToArtifact must only be rendered if there are edges present',
    );
  }

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(edge0.targetArtifactId);

  const linkClicked = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
      id: edge0.targetArtifactId,
    });
  };

  const artifactTitle = props.edges.find(
    (edge) => edge.targetArtifactTitle,
  )?.targetArtifactTitle;
  const artifactDirectEdges = props.edges.filter(
    (edge) => !edge.targetArtifactBlockId,
  );
  const artifactBlockReferences = props.edges.filter(
    (edge) => edge.targetArtifactBlockId,
  );

  return (
    <>
      <ArtifactRightSidemenuReferenceContextMenu
        paneId={pane.id}
        currentArtifactId={edge0.artifactId}
        edge={edge0}
      >
        <SidemenuCardItem
          data-edge-artifactId={edge0.targetArtifactId}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          $isButton
        >
          <SidemenuCardItemLabel ref={ref} onClick={linkClicked}>
            {artifactTitle}
            <SidemenuCardItemSublabel>
              {t('artifactRightSideMenu.outgoing.title.subtitle', {
                count: props.edges.length,
              })}
            </SidemenuCardItemSublabel>
          </SidemenuCardItemLabel>
          {props.edges.length > 1 && (
            <SidemenuCardItemEndSlot>
              <ExpandButton
                onClick={(event) => (
                  event.stopPropagation(),
                  setExpanded(!expanded)
                )}
              >
                {expanded ? (
                  <IoChevronUp size={14} />
                ) : (
                  <IoChevronDown size={14} />
                )}
              </ExpandButton>
            </SidemenuCardItemEndSlot>
          )}
          {previewInfo && ref.current && (
            <ArtifactReferencePreview
              onClick={(event) => (
                event.stopPropagation(),
                linkClicked(event),
                close()
              )}
              artifactId={edge0.targetArtifactId}
              previewInfo={previewInfo}
              referenceText={
                props.edges.length === 1
                  ? edge0.referenceText
                  : edge0.targetArtifactTitle || ''
              }
              artifactBlockId={
                props.edges.length === 1
                  ? edge0.targetArtifactBlockId || undefined
                  : undefined
              }
              artifactDate={
                props.edges.length === 1
                  ? edge0.targetArtifactDate || undefined
                  : undefined
              }
              previewTarget={ref.current}
            />
          )}
        </SidemenuCardItem>
      </ArtifactRightSidemenuReferenceContextMenu>
      {expanded && (
        <ChildReferencesContainer>
          {artifactDirectEdges.map((edge) => (
            <OutgoingReferenceItem key={edge.id} edge={edge} />
          ))}
          {artifactBlockReferences.map((edge) => (
            <OutgoingReferenceItem key={edge.id} edge={edge} />
          ))}
        </ChildReferencesContainer>
      )}
    </>
  );
};
