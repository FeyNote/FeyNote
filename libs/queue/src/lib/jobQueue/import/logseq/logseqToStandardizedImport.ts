import { readFile } from 'fs/promises';
import {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import {
  addMissingBlockIds,
  ARTIFACT_TIPTAP_BODY_KEY,
  constructYArtifact,
  getTextForJSONContent,
  getTiptapServerExtensions,
} from '@feynote/shared-utils';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { applyUpdate, encodeStateAsUpdate } from 'yjs';
import { basename, extname } from 'path';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';
import { generateJSON } from '@tiptap/html';
import { isImagePath } from '../isImagePath';
import type { LogseqBlock, LogseqGraph } from './LogseqGraph';
import { marked } from 'marked';
import {
  getLogseqReferenceIdToBlockMap,
  type ArtifactBlockInfo,
} from './getLogseqReferenceIdToBlockMap';
import { getSafeArtifactId, getSafeFileId } from '@feynote/api-services';

const replaceLogseqImageReferences = async (
  content: string,
  importInfo: StandardizedImportInfo,
  artifactId: string,
  baseImageNameToPath: Map<string, string>,
): Promise<string> => {
  /**
   * Returns five matching elements
   * 0. The full match in format either <img src="file.png" /> or ![Title](path.png){} ({} is optional)
   * 1. The full match in format <img src="file.png" />
   * 2. The src url in format file.png
   * 3. The full match in format ![Title](path.png)
   * 4. The title in [Title]
   * 5. The src url in format (path.png)
   */
  const imgRegex = /(<img src="(.*?)".*?\/>)|(!\[([^[]*?)\]\((.*?)\)({.*?})?)/g;
  for (const matchingGroups of content.matchAll(imgRegex)) {
    const imageSrc = matchingGroups[2] || matchingGroups[5];
    let replacementHtml = '';
    const id = (await getSafeFileId()).id;
    if (imageSrc.startsWith('http')) {
      importInfo.imageFilesToUpload.push({
        id,
        url: imageSrc,
        associatedArtifactId: artifactId,
      });
      replacementHtml = `<img data-fallback="${imageSrc}" fileId="${id}" />`;
    } else {
      const imgPath = baseImageNameToPath.get(basename(imageSrc));
      if (!imgPath) continue;
      importInfo.imageFilesToUpload.push({
        id,
        associatedArtifactId: artifactId,
        path: imgPath,
      });
      replacementHtml = `<img fileId="${id}" />`;
    }
    content = content.replace(matchingGroups[0], `\n\n${replacementHtml}\n\n`);
  }
  return content;
};

const replaceLogseqBlockReferences = (
  content: string,
  blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
): string => {
  // Returns two elements (the match and the src url) i.e. <img src="file.png" />
  // 0. The block reference; i.e. ((Block Id))
  // 1. The block id
  const pageReferenceRegex = /\(\((.*?)\)\)/g;
  for (const matchingGroups of content.matchAll(pageReferenceRegex)) {
    const referencedId = matchingGroups[1];
    const blockInfo = blockIdToBlockInfoMap.get(referencedId);
    if (!blockInfo) {
      // Broken reference
      continue;
    }
    const replacementHtml = `<span data-type="artifactReference" data-artifact-block-id=${blockInfo.id} data-artifact-id="${blockInfo.artifactId}" data-artifact-reference-text="${blockInfo.referenceText}"></span>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

const convertMarkdownToHtml = async (
  markdown: string,
  blockId: string,
  artifactId: string,
  importInfo: StandardizedImportInfo,
  blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
  baseImageNameToPath: Map<string, string>,
): Promise<string> => {
  markdown = await replaceLogseqImageReferences(
    markdown,
    importInfo,
    artifactId,
    baseImageNameToPath,
  );
  markdown = replaceLogseqBlockReferences(markdown, blockIdToBlockInfoMap);
  let html = marked.parse(markdown);
  const referencedBlockWithId = blockIdToBlockInfoMap.get(blockId);
  if (referencedBlockWithId) {
    html = `<p data-id="${referencedBlockWithId.id}">${html}</p>`;
  }
  return html;
};

const replacePageReferences = (
  content: string,
  pageNameToIdMap: Map<string, string>,
): string => {
  // Returns two elements (the match and the src url) i.e. <img src="file.png" />
  // 0. The full page reference; i.e. [[Page Name]]
  // 1. The page name
  const pageReferenceRegex = /\[\[(.*?)\]\]/g;
  for (const matchingGroups of content.matchAll(pageReferenceRegex)) {
    const title = matchingGroups[1];
    const id =
      pageNameToIdMap.get(title) || `00000000-0000-0000-0000-000000000000`;
    const replacementHtml = `<span data-type="artifactReference" data-artifact-id="${id}" data-artifact-reference-text="${title}"></span>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

const convertLogseqBlockToHtml = async (
  block: LogseqBlock,
  artifactId: string,
  pageNameToIdMap: Map<string, string>,
  blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
  importInfo: StandardizedImportInfo,
  baseImageNameToPath: Map<string, string>,
): Promise<string> => {
  const content = replacePageReferences(block.content, pageNameToIdMap);
  switch (block.format) {
    case 'markdown':
      return convertMarkdownToHtml(
        content,
        block.id,
        artifactId,
        importInfo,
        blockIdToBlockInfoMap,
        baseImageNameToPath,
      );
    case 'org':
      return content; // TODO: FIX
    default:
      throw new Error(`Unrecognized block format: ${block.format}`);
  }
};

const convertLogseqPageToHtml = async (
  blocks: LogseqBlock[],
  artifactId: string,
  pageNameToIdMap: Map<string, string>,
  blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
  importInfo: StandardizedImportInfo,
  baseImageNameToPath: Map<string, string>,
): Promise<string> => {
  let htmlPage = ``;
  for (const block of blocks) {
    htmlPage += await convertLogseqBlockToHtml(
      block,
      artifactId,
      pageNameToIdMap,
      blockIdToBlockInfoMap,
      importInfo,
      baseImageNameToPath,
    );
    if (block.children.length) {
      htmlPage += `<div data-content-type="blockGroup">${await convertLogseqPageToHtml(block.children, artifactId, pageNameToIdMap, blockIdToBlockInfoMap, importInfo, baseImageNameToPath)}</div>`;
    }
  }
  return htmlPage;
};

const handleLogseqGraph = async (
  importInfo: StandardizedImportInfo,
  json: LogseqGraph,
  userId: string,
  baseImageNameToPath: Map<string, string>,
) => {
  const pageNameToIdMap = new Map<string, string>();
  for (const page of json.blocks) {
    const title = page['page-name'];
    const id = (await getSafeArtifactId()).id;
    pageNameToIdMap.set(title, id);
  }

  const blockIdToBlockInfoMap = getLogseqReferenceIdToBlockMap(
    json.blocks,
    pageNameToIdMap,
  );

  for (const page of json.blocks) {
    const title = page['page-name'];
    const id = pageNameToIdMap.get(title) || (await getSafeArtifactId()).id;
    const html = await convertLogseqPageToHtml(
      page.children,
      id,
      pageNameToIdMap,
      blockIdToBlockInfoMap,
      importInfo,
      baseImageNameToPath,
    );
    const extensions = getTiptapServerExtensions({});
    const tiptap = generateJSON(html, extensions);
    addMissingBlockIds(tiptap);
    const text = getTextForJSONContent(tiptap);

    const yDoc = constructYArtifact({
      id,
      userId,
      title,
      theme: ArtifactTheme.default,
      type: ArtifactType.tiptap,
      titleBodyMerge: true,
      linkAccessLevel: ArtifactAccessLevel.noaccess,
      deletedAt: null,
    });
    const tiptapYContent = TiptapTransformer.toYdoc(
      tiptap,
      ARTIFACT_TIPTAP_BODY_KEY,
      extensions,
    );
    applyUpdate(yDoc, encodeStateAsUpdate(tiptapYContent));
    const yBin = Buffer.from(encodeStateAsUpdate(yDoc));

    importInfo.artifactsToCreate.push({
      id,
      userId,
      title,
      type: ArtifactType.tiptap,
      text,
      json: tiptap,
      yBin,
    });
  }
};

export const logseqToStandardizedImport = async (
  userId: string,
  filePaths: string[],
): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    imageFilesToUpload: [],
  };
  const baseImageNameToPath = new Map<string, string>();
  for await (const filePath of filePaths) {
    if (isImagePath(filePath)) {
      baseImageNameToPath.set(basename(filePath), filePath);
    }
  }

  for await (const filePath of filePaths) {
    if (extname(filePath) === '.json') {
      const json = JSON.parse(await readFile(filePath, 'utf-8')) as LogseqGraph;
      await handleLogseqGraph(importInfo, json, userId, baseImageNameToPath);
      break;
    }
  }
  return importInfo;
};
