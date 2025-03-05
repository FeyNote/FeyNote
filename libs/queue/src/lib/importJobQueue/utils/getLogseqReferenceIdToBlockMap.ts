import { randomUUID } from "crypto";
import type { LogseqBlock, LogseqPage } from "../LogseqGraph";

export interface ArtifactBlockInfo {
  id: string,
  artifactId: string,
  referenceText: string,
}

export const getLogseqReferenceIdToBlockMap = (
  pages: LogseqPage[],
  pageNameToIdMap: Map<string, string>,
): Map<string, ArtifactBlockInfo> => {
  const referencedBlockIds = new Set<string>();
  for (const page of pages) {
    executeOnBlock(page.children, (block) => {
      // Returns two elements (the match and the src url) i.e. <img src="file.png" />
      // 0. The block reference; i.e. ((Block Id))
      // 1. The block id
      const pageReferenceRegex = /\(\((.*?)\)\)/g
      for (const matchingGroups of block.content.matchAll(pageReferenceRegex)) {
        const referencedId = matchingGroups[1];
        referencedBlockIds.add(referencedId)
      }
    })
  }

  const referenceIdToBlockMap = new Map<string, ArtifactBlockInfo>()
  for (const page of pages) {
    executeOnBlock(page.children, (block) => {
      if (referencedBlockIds.has(block.id)) {
        referenceIdToBlockMap.set(block.id, {
          id: randomUUID(),
          artifactId: pageNameToIdMap.get(page['page-name']) || randomUUID(),
          referenceText: block.content,
        });
      }
    })
  }
  return referenceIdToBlockMap;
}

const executeOnBlock = (blocks: LogseqBlock[], executor: (block: LogseqBlock) => void): void => {
  for (const block of blocks) {
    executor(block);
    executeOnBlock(block.children, executor);
  }
}
