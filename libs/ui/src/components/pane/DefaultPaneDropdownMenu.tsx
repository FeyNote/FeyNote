import { useTranslation } from 'react-i18next';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import { DropdownMenu } from '@radix-ui/themes';
import { useKeyboardShortcutDisplay } from '../../utils/keyboardShortcuts';

interface Props {
  paneId: string;
  children: React.ReactNode;
}

export const DefaultPaneDropdownMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { getPaneById, navigate } = useGlobalPaneContext();
  const pane = getPaneById(props.paneId);
  const splitRightKeyboardShortcutDisplay =
    useKeyboardShortcutDisplay('splitRight');
  const splitDownKeyboardShortcutDisplay =
    useKeyboardShortcutDisplay('splitDown');

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
            shortcut={splitRightKeyboardShortcutDisplay || undefined}
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
            shortcut={splitDownKeyboardShortcutDisplay || undefined}
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
            {t('contextMenu.newTab')}
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
