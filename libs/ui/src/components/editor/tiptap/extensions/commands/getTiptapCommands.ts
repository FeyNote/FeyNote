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
    globalTiptapCommandHelpers.format.font.default,
    globalTiptapCommandHelpers.format.font.sans,
    globalTiptapCommandHelpers.format.font.serif,
    globalTiptapCommandHelpers.format.font.libreBaskerville,
    globalTiptapCommandHelpers.format.font.mrEavesRemake,
    globalTiptapCommandHelpers.format.font.allison,
    globalTiptapCommandHelpers.format.font.italianno,
    globalTiptapCommandHelpers.format.font.monsieurLaDoulaise,
    globalTiptapCommandHelpers.format.align.left,
    globalTiptapCommandHelpers.format.align.center,
    globalTiptapCommandHelpers.format.align.right,
    globalTiptapCommandHelpers.format.sinkBlock,
    globalTiptapCommandHelpers.format.liftBlock,
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
