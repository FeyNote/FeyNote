import { MonsterSheetFC } from '@feynote/blocknote';
import styled from 'styled-components';
import { SheetEditor } from './SheetEditor';
import { BaseSheet } from './BaseSheet';

const MonsterSheetStyles = styled(BaseSheet)`
  .tiptap {
    * {
      font-family: ScalySansRemake;
    }

    .tableWrapper:first-of-type table {
      width: auto !important;
      min-width: 325px !important;

      th,
      td {
        text-align: center;
      }
    }
  }
`;

export const MonsterSheet: MonsterSheetFC = (props) => {
  return (
    <SheetEditor
      container={MonsterSheetStyles}
      content={props.block.props.content}
      onUpdate={(update) => {
        props.editor.updateBlock(props.block, {
          props: {
            content: update.content,
            contentHtml: update.contentHtml,
          },
        });
      }}
    />
  );
};
