import { useTranslation } from 'react-i18next';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuItem,
} from '../contextMenu/sharedComponents';
import { PaneContextData } from '../../context/pane/PaneContext';

interface Props {
  pane: PaneContextData['pane'];
  navigate: PaneContextData['navigate'];
}

export const PaneTabContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            props.navigate(
              props.pane.currentView.component,
              props.pane.currentView.props,
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
