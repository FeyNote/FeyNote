import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import { DropdownMenu } from '@radix-ui/themes';

interface Props {
  paneId: string;
  children: React.ReactNode;
}

export const DefaultPaneDropdownMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { getPaneById, navigate } = useContext(GlobalPaneContext);
  const pane = getPaneById(props.paneId);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{props.children}</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Item
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
          </DropdownMenu.Item>
          <DropdownMenu.Item
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
          </DropdownMenu.Item>
          <DropdownMenu.Item
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
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
