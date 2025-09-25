import { useTranslation } from 'react-i18next';
import {
  ArtifactLinkContextMenu,
  type ArtifactLinkContextMenuProps,
} from './ArtifactLinkContextMenu';
import { ContextMenu } from '@radix-ui/themes';

interface Props extends ArtifactLinkContextMenuProps {
  enabled: boolean;
  expandAll: () => void;
  collapseAll: () => void;
}

export const ArtifactTreeItemContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const { enabled, expandAll, collapseAll, ...contextMenuProps } = props;

  const extraContextMenuContent = (
    <ContextMenu.Group>
      <ContextMenu.Item onClick={expandAll}>
        {t('contextMenu.expandAll')}
      </ContextMenu.Item>
      <ContextMenu.Item onClick={collapseAll}>
        {t('contextMenu.collapseAll')}
      </ContextMenu.Item>
    </ContextMenu.Group>
  );

  if (!enabled) {
    return props.children;
  }

  return (
    <ArtifactLinkContextMenu
      {...contextMenuProps}
      additionalContextMenuContentsBefore={extraContextMenuContent}
    />
  );
};
