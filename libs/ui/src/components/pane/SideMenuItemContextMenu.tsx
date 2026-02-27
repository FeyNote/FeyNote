import { useTranslation } from 'react-i18next';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import {
  PaneableComponent,
  type PaneableComponentProps,
} from '../../context/globalPane/PaneableComponent';
import { ContextMenu } from '@radix-ui/themes';

interface SideMenuItemContextMenuProps<T extends PaneableComponent> {
  component: T;
  componentProps: PaneableComponentProps[T];
  paneId: string | undefined;
  children: React.ReactNode;
}

export const SideMenuItemContextMenu = <T extends PaneableComponent>(
  props: SideMenuItemContextMenuProps<T>,
) => {
  const { t } = useTranslation();
  const { navigate } = useGlobalPaneContext();

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{props.children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item
          onClick={() =>
            navigate(
              props.paneId,
              props.component,
              props.componentProps,
              PaneTransition.HSplit,
            )
          }
        >
          {t('contextMenu.splitRight')}
        </ContextMenu.Item>
        <ContextMenu.Item
          onClick={() =>
            navigate(
              props.paneId,
              props.component,
              props.componentProps,
              PaneTransition.VSplit,
            )
          }
        >
          {t('contextMenu.splitDown')}
        </ContextMenu.Item>
        <ContextMenu.Item
          onClick={() =>
            navigate(
              props.paneId,
              props.component,
              props.componentProps,
              PaneTransition.NewTab,
            )
          }
        >
          {t('contextMenu.newTab')}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};
