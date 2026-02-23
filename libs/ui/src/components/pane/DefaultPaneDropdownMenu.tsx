import { useTranslation } from 'react-i18next';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import { DropdownMenu } from '@radix-ui/themes';
import {
  APP_KEYBOARD_SHORTCUTS,
  getDesktopBrowserShortcutDisplayString,
} from '../../utils/keyboardShortcuts';

interface Props {
  paneId: string;
  children: React.ReactNode;
}

export const DefaultPaneDropdownMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { getPaneById, navigate } = useGlobalPaneContext();
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
            shortcut={getDesktopBrowserShortcutDisplayString(
              APP_KEYBOARD_SHORTCUTS.splitRight.native,
              APP_KEYBOARD_SHORTCUTS.splitRight.browser,
            )}
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
            shortcut={getDesktopBrowserShortcutDisplayString(
              APP_KEYBOARD_SHORTCUTS.splitDown.native,
              APP_KEYBOARD_SHORTCUTS.splitDown.browser,
            )}
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
