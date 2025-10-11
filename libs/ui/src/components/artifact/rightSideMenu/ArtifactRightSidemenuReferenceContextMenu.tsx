import { useTranslation } from 'react-i18next';
import type { Edge } from '@feynote/shared-utils';
import { scrollBlockIntoView } from '../../editor/scrollBlockIntoView';
import { animateHighlightBlock } from '../../editor/animateHighlightBlock';
import { ArtifactLinkContextMenu } from '../ArtifactLinkContextMenu';
import { ContextMenu } from '@radix-ui/themes';

interface Props {
  paneId: string;
  currentArtifactId: string;
  edge: Edge;
  children: React.ReactNode;
}

export const ArtifactRightSidemenuReferenceContextMenu: React.FC<Props> = (
  props,
) => {
  const { t } = useTranslation();

  const artifactBlockId =
    props.currentArtifactId === props.edge.artifactId
      ? props.edge.artifactBlockId
      : props.edge.targetArtifactBlockId;
  const otherArtifactId =
    props.currentArtifactId === props.edge.artifactId
      ? props.edge.targetArtifactId
      : props.edge.artifactId;
  const otherArtifactBlockId =
    props.currentArtifactId === props.edge.artifactId
      ? props.edge.targetArtifactBlockId
      : props.edge.artifactBlockId;
  const otherArtifactDate =
    props.currentArtifactId === props.edge.artifactId
      ? props.edge.targetArtifactDate
      : undefined;

  const extraContextMenuContent = artifactBlockId && (
    <ContextMenu.Group>
      <ContextMenu.Item
        onClick={() => {
          const paneElement = document.querySelector(
            `[data-pane-id="${props.paneId}"]`,
          );

          scrollBlockIntoView(artifactBlockId, paneElement);
          animateHighlightBlock(artifactBlockId, paneElement);
        }}
      >
        {t('contextMenu.revealInArtifact')}
      </ContextMenu.Item>
    </ContextMenu.Group>
  );

  return (
    <ArtifactLinkContextMenu
      artifactId={otherArtifactId}
      artifactBlockId={otherArtifactBlockId || undefined}
      artifactDate={otherArtifactDate || undefined}
      paneId={props.paneId}
      additionalContextMenuContentsBefore={extraContextMenuContent}
      children={props.children}
    />
  );
};
