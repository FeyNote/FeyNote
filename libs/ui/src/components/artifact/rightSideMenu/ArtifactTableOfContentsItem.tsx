import type { TableOfContentDataItem } from '@tiptap-pro/extension-table-of-contents';
import { useContext, type MouseEvent } from 'react';
import { CompactIonItem } from '../../CompactIonItem';
import { TextSelection } from '@tiptap/pm/state';
import styled from 'styled-components';
import { scrollBlockIntoView } from '../../editor/scrollBlockIntoView';
import { animateHighlightBlock } from '../../editor/animateHighlightBlock';
import { PaneContext } from '../../../context/pane/PaneContext';
import { useContextMenu } from '../../../utils/contextMenu/useContextMenu';
import { ArtifactTableOfContentsItemContextMenu } from './ArtifactTableOfContentsItemContextMenu';

const ToCItem = styled(CompactIonItem)<{ $isActive: boolean }>`
  margin-left: calc(0.875rem * (var(--toc-level) - 1));

  ${({ $isActive }) =>
    $isActive &&
    `
    background-color: var(--ion-color-light-tint);
  `}
`;

interface Props {
  artifactId: string;
  item: TableOfContentDataItem;
}

export const ArtifactTableOfContentsItem: React.FC<Props> = (props) => {
  const { pane, navigate } = useContext(PaneContext);

  const { onContextMenu } = useContextMenu(
    ArtifactTableOfContentsItemContextMenu,
    {
      navigate,
      paneId: pane.id,
      currentArtifactId: props.artifactId,
      blockId: props.item.id,
    },
  );

  const onItemClick = (event: MouseEvent) => {
    const { id, editor, dom } = props.item;

    event.preventDefault();

    try {
      const pos = editor.view.posAtDOM(dom, 0);

      const tr = editor.view.state.tr;
      tr.setSelection(new TextSelection(tr.doc.resolve(pos)));
      editor.view.dispatch(tr);
      editor.view.focus();
    } catch (_e) {
      // This bit of code is a little finnicky, since we can't rely on the create/destroy state of the react editor
      // and unfortunately tiptap doesn't call the ref every time the editor is re-created
    }

    const paneElement = document.querySelector(`[data-pane-id="${pane.id}"]`);
    scrollBlockIntoView(id, paneElement);
    animateHighlightBlock(id, paneElement);
  };

  return (
    <ToCItem
      $isActive={props.item.isActive}
      onClick={(event) => onItemClick(event)}
      onContextMenu={onContextMenu}
      lines="none"
      button
      style={{
        '--toc-level': props.item.level,
      }}
    >
      {props.item.textContent}
    </ToCItem>
  );
};
