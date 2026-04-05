import { useRef, useState } from 'react';
import { usePaneContext } from '../../../../context/pane/PaneContext';
import { PaneableComponent } from '../../../../context/globalPane/PaneableComponent';
import { useNavigateWithKeyboardHandler } from '../../../../utils/useNavigateWithKeyboardHandler';
import { useArtifactPreviewTimer } from '../../../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { ArtifactReferencePreview } from '../../../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';
import { useTranslation } from 'react-i18next';
import type { Edge } from '@feynote/shared-utils';
import { IncomingReferenceItem } from './IncomingReferenceItem';
import styled from 'styled-components';
import { ArtifactRightSidemenuReferenceContextMenu } from '../ArtifactRightSidemenuReferenceContextMenu';
import { IoChevronDown, IoChevronUp } from '../../../AppIcons';
import { FeynoteCardItem } from '../../../card/FeynoteCardItem';
import { FeynoteCardItemLabel } from '../../../card/FeynoteCardItemLabel';
import { FeynoteCardItemSublabel } from '../../../card/FeynoteCardItemSublabel';
import { FeynoteCardItemEndSlot } from '../../../card/FeynoteCardItemEndSlot';

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

export const IncomingReferencesFromArtifact: React.FC<Props> = (props) => {
  const { pane } = usePaneContext();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const edge0 = props.edges.at(0);
  if (!edge0) {
    throw new Error(
      'ArtifactRightSidemenuReferenceGroup must only be rendered if there are edges present',
    );
  }
  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(edge0.artifactId);

  const linkClicked = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
      id: edge0.artifactId,
    });
  };

  return (
    <>
      <ArtifactRightSidemenuReferenceContextMenu
        paneId={pane.id}
        currentArtifactId={edge0.targetArtifactId}
        edge={edge0}
      >
        <FeynoteCardItem
          data-edge-artifactid={edge0.artifactId}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          $isButton
        >
          <FeynoteCardItemLabel ref={ref} onClick={linkClicked}>
            {edge0.artifactTitle}
            <FeynoteCardItemSublabel>
              {t('artifactRightSideMenu.incoming.title.subtitle', {
                count: props.edges.length,
              })}
            </FeynoteCardItemSublabel>
          </FeynoteCardItemLabel>
          {props.edges.length > 1 && (
            <FeynoteCardItemEndSlot>
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
            </FeynoteCardItemEndSlot>
          )}
          {previewInfo && ref.current && (
            <ArtifactReferencePreview
              onClick={(event) => (
                event.stopPropagation(),
                linkClicked(event),
                close()
              )}
              artifactId={edge0.artifactId}
              previewInfo={previewInfo}
              referenceText={''}
              artifactBlockId={
                props.edges.length === 1 ? edge0.artifactBlockId : undefined
              }
              artifactDate={undefined}
              previewTarget={ref.current}
            />
          )}
        </FeynoteCardItem>
      </ArtifactRightSidemenuReferenceContextMenu>
      {expanded && (
        <ChildReferencesContainer>
          {props.edges.map((edge) => (
            <IncomingReferenceItem key={edge.id} edge={edge} />
          ))}
        </ChildReferencesContainer>
      )}
    </>
  );
};
