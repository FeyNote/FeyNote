import {
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
} from '@blocknote/react';
import { ArtifactEditor, ArtifactEditorPartialBlock } from '@feynote/blocknote';
import { MdHorizontalRule } from 'react-icons/md';
import { TiDocumentText } from 'react-icons/ti';
import { monsterSheetDefaultProps } from './sheets/monsterSheetDefaultProps';

const insertHorizontalRuleItem = (editor: ArtifactEditor) => ({
  title: 'Horizontal Rule',
  onItemClick: () => {
    const currentBlock = editor.getTextCursorPosition().block;

    const horizontalRuleBlock = {
      type: 'horizontalRule',
    } satisfies ArtifactEditorPartialBlock;

    // Inserting the new block after the current one.
    editor.insertBlocks([horizontalRuleBlock], currentBlock, 'after');
  },
  aliases: ['horizontalrule', 'hr'],
  group: 'Other',
  icon: <MdHorizontalRule size={18} />,
  subtext: 'Used to display a horizontal break in your document',
});

const insertMonsterSheetItem = (editor: ArtifactEditor) => ({
  title: 'Monster Stat Block',
  onItemClick: () => {
    const currentBlock = editor.getTextCursorPosition().block;

    const monsterSheetBlock = {
      type: 'monsterSheet',
      props: monsterSheetDefaultProps,
    } satisfies ArtifactEditorPartialBlock;

    // Inserting the new block after the current one.
    editor.insertBlocks([monsterSheetBlock], currentBlock, 'after');
  },
  aliases: ['Monster', 'Stat Sheet', 'Stat Block'],
  group: 'Other',
  icon: <TiDocumentText size={18} />,
  subtext: 'A traditionally-decorated monster stat block',
});

export const getSlashMenuItems = (
  editor: ArtifactEditor,
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  insertHorizontalRuleItem(editor),
  insertMonsterSheetItem(editor),
];
