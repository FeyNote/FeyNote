import { SpellSheetFC } from '@feynote/blocknote';
import styled from 'styled-components';
import { SheetEditor } from './SheetEditor';
import { BaseSheet } from './BaseSheet';

const SpellSheetStyles = styled(BaseSheet)``;

export const SpellSheet: SpellSheetFC = (props) => {
  return 'sadf';
  // <SheetEditor
  //   container={SpellSheetStyles}
  //   content={props.block.props.content}
  //   onUpdate={(update) => {
  //     props.editor.updateBlock(props.block, {
  //       props: {
  //         content: update.content,
  //         contentHtml: update.contentHtml,
  //       },
  //     });
  //   }}
  // />
};
