import { Block } from '@blocknote/core';

const isMatch = (query: string, val: string) => {
  if (!val.trim()) return false;
  if (query === '*') return !!val;
  return val.includes(query);
};

export interface BlocksByStringQueryResult {
  block: Block;
  matchedText: string;
}

export const getBlocksByStringQuery = (query: string, blocks: Block[]) => {
  if (!query.trim()) return [];

  const results: BlocksByStringQueryResult[] = [];
  for (const block of blocks) {
    const childrenResults = getBlocksByStringQuery(query, block.children);
    results.push(...childrenResults);

    if (
      block.type === 'heading' ||
      block.type === 'paragraph' ||
      block.type === 'bulletListItem' ||
      block.type === 'numberedListItem'
    ) {
      for (const content of block.content) {
        if (content.type === 'text' && isMatch(query, content.text)) {
          results.push({
            block,
            matchedText: content.text,
          });
        }

        if (content.type === 'link') {
          for (const linkContent of content.content) {
            if (isMatch(query, linkContent.text)) {
              results.push({
                block,
                matchedText: linkContent.text,
              });
            }
          }
        }
      }
    } else if (block.type === 'image') {
      if (isMatch(query, block.props.caption)) {
        results.push({
          block,
          matchedText: block.props.caption,
        });
      }
    }
  }

  return results;
};
