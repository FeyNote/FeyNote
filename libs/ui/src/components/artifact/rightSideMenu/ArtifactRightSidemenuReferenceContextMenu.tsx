import { useTranslation } from 'react-i18next';
import { PaneTransition } from '../../../context/globalPane/GlobalPaneContext';
import { type PaneContextData } from '../../../context/pane/PaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuGroupDivider,
  ContextMenuItem,
} from '../../contextMenu/sharedComponents';
import type { Edge } from '@feynote/shared-utils';
import { PaneableComponent } from '../../../context/globalPane/PaneableComponent';
import { scrollBlockIntoView } from '../../editor/scrollBlockIntoView';
import { animateHighlightBlock } from '../../editor/animateHighlightBlock';

interface Props {
  paneId: string;
  currentArtifactId: string;
  edge: Edge;
  navigate: PaneContextData['navigate'];
}

export const ArtifactRightSidemenuReferenceContextMenu: React.FC<Props> = (
  props,
) => {
  const { t } = useTranslation();
  const { navigate } = props;

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

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            navigate(
              PaneableComponent.Artifact,
              {
                id: otherArtifactId,
                focusBlockId: otherArtifactBlockId || undefined,
                focusDate: otherArtifactDate || undefined,
              },
              PaneTransition.HSplit,
            )
          }
        >
          {t('contextMenu.splitRight')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              PaneableComponent.Artifact,
              {
                id: otherArtifactId,
                focusBlockId: otherArtifactBlockId || undefined,
                focusDate: otherArtifactDate || undefined,
              },
              PaneTransition.VSplit,
            )
          }
        >
          {t('contextMenu.splitDown')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              PaneableComponent.Artifact,
              {
                id: otherArtifactId,
                focusBlockId: otherArtifactBlockId || undefined,
                focusDate: otherArtifactDate || undefined,
              },
              PaneTransition.NewTab,
            )
          }
        >
          {t('contextMenu.newTab')}
        </ContextMenuItem>
      </ContextMenuGroup>
      {artifactBlockId && (
        <>
          <ContextMenuGroupDivider />
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() => {
                const paneElement = document.querySelector(
                  `[data-pane-id="${props.paneId}"]`,
                );

                scrollBlockIntoView(artifactBlockId, paneElement);
                animateHighlightBlock(artifactBlockId, paneElement);
              }}
            >
              {t('contextMenu.revealInArtifact')}
            </ContextMenuItem>
          </ContextMenuGroup>
        </>
      )}
    </ContextMenuContainer>
  );
};
