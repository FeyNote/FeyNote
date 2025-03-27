import { useTranslation } from 'react-i18next';
import { PaneTransition } from '../../../context/globalPane/GlobalPaneContext';
import { type PaneContextData } from '../../../context/pane/PaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuGroupDivider,
  ContextMenuItem,
} from '../../contextMenu/sharedComponents';
import { PaneableComponent } from '../../../context/globalPane/PaneableComponent';
import { scrollBlockIntoView } from '../../editor/scrollBlockIntoView';
import { animateHighlightBlock } from '../../editor/animateHighlightBlock';

interface Props {
  paneId: string;
  currentArtifactId: string;
  blockId: string;
  navigate: PaneContextData['navigate'];
}

export const ArtifactTableOfContentsItemContextMenu: React.FC<Props> = (
  props,
) => {
  const { t } = useTranslation();
  const { navigate } = props;

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            navigate(
              PaneableComponent.Artifact,
              {
                id: props.currentArtifactId,
                focusBlockId: props.blockId,
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
                id: props.currentArtifactId,
                focusBlockId: props.blockId,
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
                id: props.currentArtifactId,
                focusBlockId: props.blockId,
              },
              PaneTransition.NewTab,
            )
          }
        >
          {t('contextMenu.newTab')}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuGroupDivider />
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() => {
            const paneElement = document.querySelector(
              `[data-pane-id="${props.paneId}"]`,
            );

            scrollBlockIntoView(props.blockId, paneElement);
            animateHighlightBlock(props.blockId, paneElement);
          }}
        >
          {t('contextMenu.revealInArtifact')}
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContainer>
  );
};
