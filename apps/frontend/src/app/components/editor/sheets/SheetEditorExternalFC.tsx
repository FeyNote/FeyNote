import { MonsterSheetFC } from '@feynote/blocknote';

export const SheetEditorExternalFC: MonsterSheetFC = (props) => {
  return (
    // TODO: Sanitize HTML prior to render
    <div
      dangerouslySetInnerHTML={{ __html: props.block.props.contentHtml }}
    ></div>
  );
};
