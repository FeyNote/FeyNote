import { Editor } from '@tiptap/react';
import { globalTiptapCommandHelpers } from '../../../globalTiptapCommandHelpers';

export const getTiptapCommands = ({
  query,
  editor,
}: {
  query: string;
  editor: Editor;
}) => {
  const commands = [
    globalTiptapCommandHelpers.insert.hr,
    globalTiptapCommandHelpers.insert.table,
    globalTiptapCommandHelpers.insert.monster,
    globalTiptapCommandHelpers.insert.wideMonster,
    globalTiptapCommandHelpers.insert.spell,
    globalTiptapCommandHelpers.insert.note,
    globalTiptapCommandHelpers.format.heading.h1,
    globalTiptapCommandHelpers.format.heading.h2,
    globalTiptapCommandHelpers.format.heading.h3,
    globalTiptapCommandHelpers.format.heading.h4,
    globalTiptapCommandHelpers.format.heading.h5,
    globalTiptapCommandHelpers.format.heading.h6,
    globalTiptapCommandHelpers.format.list.bulletList,
    globalTiptapCommandHelpers.format.list.orderedList,
    globalTiptapCommandHelpers.format.list.taskList,
    globalTiptapCommandHelpers.format.paragraph,
    globalTiptapCommandHelpers.format.align.left,
    globalTiptapCommandHelpers.format.align.center,
    globalTiptapCommandHelpers.format.align.right,
    globalTiptapCommandHelpers.format.sinkBlock,
    globalTiptapCommandHelpers.format.liftBlock,
    globalTiptapCommandHelpers.format.table.insertColBefore,
    globalTiptapCommandHelpers.format.table.insertColAfter,
    globalTiptapCommandHelpers.format.table.deleteCol,
    globalTiptapCommandHelpers.format.table.insertRowAbove,
    globalTiptapCommandHelpers.format.table.insertRowBelow,
    globalTiptapCommandHelpers.format.table.deleteRow,
    globalTiptapCommandHelpers.format.table.toggleHeaderRow,
    globalTiptapCommandHelpers.format.table.toggleHeaderCol,
    globalTiptapCommandHelpers.format.table.toggleHeaderCell,
    globalTiptapCommandHelpers.format.table.deleteTable,
  ];

  return commands
    .filter((item) => item.enabled(editor))
    .filter((item) => {
      const keywords = (
        item.title +
        ' ' +
        item.keywords.join(' ')
      ).toLowerCase();

      const searchTokens = query.toLowerCase().split(' ');

      for (const searchToken of searchTokens) {
        if (!keywords.includes(searchToken)) return false;
      }
      return true;
    });
};
