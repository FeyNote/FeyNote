import { useTranslation } from 'react-i18next';
import { scrollBlockIntoView } from '../../editor/scrollBlockIntoView';
import { animateHighlightBlock } from '../../editor/animateHighlightBlock';
import { ContextMenu } from '@radix-ui/themes';
import { ArtifactLinkContextMenu } from '../ArtifactLinkContextMenu';

interface Props {
  paneId: string;
  artifactId: string;
  artifactBlockId: string;
  children: React.ReactNode;
}

export const ArtifactTableOfContentsItemContextMenu: React.FC<Props> = (
  props,
) => {
  const { t } = useTranslation();

  const extraContextMenuContent = (
    <ContextMenu.Item
      onClick={() => {
        const paneElement = document.querySelector(
          `[data-pane-id="${props.paneId}"]`,
        );

        scrollBlockIntoView(props.artifactBlockId, paneElement);
        animateHighlightBlock(props.artifactBlockId, paneElement);
      }}
    >
      {t('contextMenu.revealInArtifact')}
    </ContextMenu.Item>
  );

  return (
    <ArtifactLinkContextMenu
      artifactId={props.artifactId}
      artifactBlockId={props.artifactBlockId}
      paneId={props.paneId}
      additionalContextMenuContentsBefore={extraContextMenuContent}
      children={props.children}
    />
  );
};
