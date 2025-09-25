import { useTranslation } from 'react-i18next';
import {
  PaneTransition,
  useGlobalPaneContext,
  type PaneTracker,
} from '../../context/globalPane/GlobalPaneContext';
import { ContextMenu } from '@radix-ui/themes';

interface Props {
  paneId: string;
  children: React.ReactNode;
}

export const PaneTabContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate, getPaneById } = useGlobalPaneContext();

  let pane: PaneTracker | undefined = undefined;
  try {
    pane = getPaneById(props.paneId);
  } catch (e) {
    console.error(e);
  }

  if (!pane) {
    return props.children;
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{props.children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Group>
          <ContextMenu.Item
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
          </ContextMenu.Item>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};
