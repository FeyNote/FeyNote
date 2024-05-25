import { ArtifactEditorBlock } from '@feynote/blocknote';

export const getTextForBlock = (block: ArtifactEditorBlock): string => {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
    case 'bulletListItem':
    case 'checkListItem':
    case 'numberedListItem': {
      const text = block.content
        .map((content) => {
          if (content.type === 'text') {
            return content.text;
          }
          if (content.type === 'link') {
            return content.content
              .map((linkContent) => linkContent.text)
              .join(' ');
          }
          if (content.type === 'artifactReference') {
            return '@...';
          }
          if (content.type === 'artifactBlockReference') {
            return '@...';
          }

          // This error is here to catch any issues where we may update blocknote and it introduces a new type that we don't have a means of handling and don't want to insert invalid previewtext into the database
          throw new Error('Unrecognized content type');
        })
        .map((text) => text.trim())
        .filter((text) => !!text)
        .join(' ');

      return text || 'getTextForBlock.noTextGeneric';
    }
    case 'image': {
      return block.props.caption || 'getTextForBlock.noTextImage';
    }
    case 'table': {
      const cellMemberText = block.content.rows.reduce((acc, row) => {
        for (const cell in row.cells) {
          acc.push(cell);
        }

        return acc;
      }, [] as string[]);

      const resultText = cellMemberText
        .map((textEntry) => textEntry.trim())
        .filter((textEntry) => !!textEntry)
        .join(' ');

      return resultText || 'getTextForBlock.noTextTable';
    }
    case 'horizontalRule': {
      return '';
    }
    case 'monsterSheet': {
      // TODO: strip HTML from block contentHtml
      return 'Not implemented yet';
    }
    case 'file':
    case 'audio':
    case 'video': {
      return 'File';
    }
  }
};
