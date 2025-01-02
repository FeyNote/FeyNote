import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuItem,
} from '../contextMenu/sharedComponents';

interface Props {
  paneId: string;
}

export const DefaultContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { getPaneById, navigate } = useContext(GlobalPaneContext);
  const pane = getPaneById(props.paneId);

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            navigate(
              props.paneId,
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
              props.paneId,
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
              props.paneId,
              pane.currentView.component,
              pane.currentView.props,
              PaneTransition.NewTab,
            )
          }
        >
          {t('contextMenu.duplicateTab')}
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContainer>
  );
};
