import { randomUUID } from 'crypto';
import type { LogseqBlock, LogseqPage } from './LogseqGraph';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';
import removeMarkdown from 'remove-markdown';

const executeOnBlock = (
  blocks: LogseqBlock[],
  executor: (block: LogseqBlock) => void,
): void => {
  for (const block of blocks) {
    executor(block);
    executeOnBlock(block.children, executor);
  }
};

export const getLogseqReferenceIdToBlockMap = (args: {
  pages: LogseqPage[];
  pageNameToIdMap: Map<string, string | null>;
}): Map<string, ArtifactBlockInfo> => {
  const referenceIdToReferenceTextMap = new Map<string, string>();
  for (const page of args.pages) {
    // TODO: Implement Logseq Whiteboards https://github.com/FeyNote/FeyNote/issues/845
    if (page.properties?.['ls-type'] === 'whiteboard-page') continue;
    executeOnBlock(page.children, (block) => {
      // Returns four elements i.e.[Reference Text]((Block Id))
      // 0. The full match (not used)
      // 1. The reference text w/ brackets; [Reference Text]
      // 2. The reference text; Reference Text
      // 3. The block id; Block Id
      const pageReferenceRegex = /(\[(.*)\])?\(\(*(.*?)\)*\)/g;
      for (const matchingGroups of block.content.matchAll(pageReferenceRegex)) {
        const referencedId = matchingGroups[3];
        referenceIdToReferenceTextMap.set(referencedId, matchingGroups[2]);
      }
    });
  }

  const referenceIdToBlockMap = new Map<string, ArtifactBlockInfo>();
  for (const page of args.pages) {
    executeOnBlock(page.children, (block) => {
      if (referenceIdToReferenceTextMap.has(block.id)) {
        let referenceText =
          referenceIdToReferenceTextMap.get(block.id) || block.content;
        referenceText =
          block.format === 'markdown'
            ? removeMarkdown(referenceText)
            : referenceText; // TODO: Implement org mode support https://github.com/FeyNote/FeyNote/issues/846
        referenceIdToBlockMap.set(block.id, {
          id: randomUUID(),
          artifactId:
            args.pageNameToIdMap.get(page['page-name']) || randomUUID(),
          referenceText,
        });
      }
    });
  }
  return referenceIdToBlockMap;
};
