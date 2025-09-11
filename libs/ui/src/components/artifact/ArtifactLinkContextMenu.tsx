import { useTranslation } from 'react-i18next';
import { useArtifactDeleteOrRemoveSelf } from './useArtifactDeleteOrRemoveSelf';
import { useContext } from 'react';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneContext } from '../../context/pane/PaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuGroupDivider,
  ContextMenuItem,
} from '../contextMenu/sharedComponents';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';

interface Props {
  artifactId: string;
}

export const ArtifactLinkContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { pane, navigateHistoryBack, navigate } = useContext(PaneContext);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const { deleteArtifactOrRemoveSelf } = useArtifactDeleteOrRemoveSelf();

  const onDeleteArtifactClicked = () => {
    deleteArtifactOrRemoveSelf(props.artifactId)
      .catch((e) => {
        handleTRPCErrors(e);
      })
      .then(() => {
        navigateHistoryBack();
      });
  };

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            navigate(
              pane.currentView.component,
              pane.currentView.props,
              PaneTransition.Push,
            )
          }
        >
          {t('contextMenu.splitRight')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              pane.currentView.component,
              pane.currentView.props,
              PaneTransition.Push,
            )
          }
        >
          {t('contextMenu.splitDown')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              pane.currentView.component,
              pane.currentView.props,
              PaneTransition.Push,
            )
          }
        >
          {t('contextMenu.duplicateTab')}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuGroupDivider />
      <ContextMenuGroup>
        <ContextMenuItem onClick={onDeleteArtifactClicked}>
          {t('generic.delete')}
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContainer>
  );
};
