import { useTranslation } from 'react-i18next';
import {
  ArtifactDeleteDeclinedError,
  useArtifactDelete,
} from './useArtifactDelete';
import { PaneContextData } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuGroupDivider,
  ContextMenuItem,
} from '../contextMenu/sharedComponents';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';

interface Props {
  artifactId: string;
  pane: PaneContextData['pane'];
  navigate: PaneContextData['navigate'];
}

export const ArtifactContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { pane, navigate } = props;

  const { deleteArtifact } = useArtifactDelete();

  const onDeleteArtifactClicked = () => {
    deleteArtifact(props.artifactId)
      .then(() => {
        navigate(PaneableComponent.Dashboard, {}, PaneTransition.Replace);
      })
      .catch((e) => {
        if (e instanceof ArtifactDeleteDeclinedError) return;

        throw e;
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
              PaneTransition.HSplit,
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
              PaneTransition.VSplit,
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
              PaneTransition.NewTab,
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
