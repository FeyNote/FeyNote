import type { TableOfContentDataItem } from '@tiptap/extension-table-of-contents';
import { type MouseEvent } from 'react';
import { TextSelection } from '@tiptap/pm/state';
import styled from 'styled-components';
import { scrollBlockIntoView } from '../../editor/scrollBlockIntoView';
import { animateHighlightBlock } from '../../editor/animateHighlightBlock';
import { usePaneContext } from '../../../context/pane/PaneContext';
import { ArtifactTableOfContentsItemContextMenu } from './ArtifactTableOfContentsItemContextMenu';
import { SidemenuCardItem } from '../../sidemenu/SidemenuComponents';

const ToCItem = styled(SidemenuCardItem)`
  margin-left: calc(0.875rem * (var(--toc-level) - 1));
`;

interface Props {
  artifactId: string;
  item: TableOfContentDataItem;
}

export const ArtifactTableOfContentsItem: React.FC<Props> = (props) => {
  const { pane } = usePaneContext();

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
    <ArtifactTableOfContentsItemContextMenu
      paneId={pane.id}
      artifactId={props.artifactId}
      artifactBlockId={props.item.id}
    >
      <ToCItem
        $isButton
        onClick={(event) => onItemClick(event)}
        style={{
          '--toc-level': props.item.level,
        }}
      >
        {props.item.textContent}
      </ToCItem>
    </ArtifactTableOfContentsItemContextMenu>
  );
};
