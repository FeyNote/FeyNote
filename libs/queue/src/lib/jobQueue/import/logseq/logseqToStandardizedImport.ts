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
import type { LogseqBlock, LogseqGraph } from './LogseqGraph';
import { marked } from 'marked';
import { getLogseqReferenceIdToBlockMap } from './getLogseqReferenceIdToBlockMap';
import { getSafeArtifactId } from '@feynote/api-services';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';
import { replaceMarkdownMediaLinks } from '../replaceMarkdownMediaLinks';
import { replaceMarkdownMediaTags } from '../replaceMarkdownMediaTags';
import type { JobProgressTracker } from '../../JobProgressTracker';
import type { JobSummary } from '@feynote/prisma/types';

const convertLogseqTableToMarkdown = (logseqTable: string): string => {
  const lines = logseqTable.split('\n');
  const numOfCols = lines[0].split(/\|[^|]*\|/).length;
  const delimter = '|' + ' ----- |'.repeat(numOfCols);
  lines.splice(1, 0, delimter);
  return lines.join('\n');
};

const replaceTables = (content: string): string => {
  // Returns one element; | Table Header | Table Header |
  //                      | Table Value  | Table Value  |
  // 0. The full match
  const tableRegex = /(^\|.*?\|$\n?)+/gm;
  for (const matchingGroups of content.matchAll(tableRegex)) {
    const logseqTable = matchingGroups[0];
    const table = convertLogseqTableToMarkdown(logseqTable);
    content = content.replace(matchingGroups[0], table);
  }
  return content;
};

const replaceBlockquotes = (content: string): string => {
  // Returns two elements; > Blockquote text
  // 0. The full match
  // 1. The blockquote text
  const blockQuoteRegex = /> (.*)/g;
  for (const matchingGroups of content.matchAll(blockQuoteRegex)) {
    const text = matchingGroups[1];
    const replacementHtml = `\n<div data-content-type="blockGroup">${text}</div>\n`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

const replaceInlineCode = (content: string): string => {
  // Returns two elements; <pre><code>...</pre></code>
  // 0. The full match
  // 1. The inline code
  const codeBlockRegex = /`(.*?)`/g;
  for (const matchingGroups of content.matchAll(codeBlockRegex)) {
    const code = matchingGroups[1];
    const replacementHtml = `<p><code>${code}</code></p>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

const replaceCodeblocks = (content: string): string => {
  // Returns two elements; <pre><code>...</pre></code>
  // 0. The full match
  // 1. The highlighted text
  const codeBlockRegex = /```([\s\S]*?)```/gm;
  for (const matchingGroups of content.matchAll(codeBlockRegex)) {
    const text = matchingGroups[1];
    const replacementHtml = `<pre><code>${text}</code></pre>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

const replaceHighlightedText = (content: string): string => {
  // Returns two elements; ==Highlighted Text==
  // 0. The full match
  // 1. The highlighted text
  const highlightedTextRegex = /==(.*?)==/g;
  for (const matchingGroups of content.matchAll(highlightedTextRegex)) {
    const text = matchingGroups[1];
    const replacementHtml = `<mark>${text}</mark>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

const replaceLogseqBlockReferences = (
  content: string,
  blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
): string => {
  // Returns four elements; [Alias](((Block Id))) || ((Block Id))
  // 0. The block reference
  // 1. The reference alias; i.e. Alias
  // 2. The block id from the alias expression; i.e. Block Id
  // 3. The block id from the non-alias expression; i.e. Block Id
  const blockReferenceRegex = /\[(.*)\]?\(\(\((.*?)\)\)\)|\(\((.*)\)\)/g;
  for (const matchingGroups of content.matchAll(blockReferenceRegex)) {
    const referencedId = matchingGroups[2] || matchingGroups[3];
    const blockInfo = blockIdToBlockInfoMap.get(referencedId);
    const brokenReferenceId = `00000000-0000-0000-0000-000000000000`;
    const replacementHtml = `<span data-type="artifactReference" data-artifact-block-id=${blockInfo?.id || brokenReferenceId} data-artifact-id="${blockInfo?.artifactId || brokenReferenceId}" data-artifact-reference-text="${blockInfo?.referenceText}"></span>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

const replaceLogseqPageReferences = (
  content: string,
  pageNameToIdMap: Map<string, string>,
): string => {
  // Returns four elements; [Alias]([[Page Name]]) || [[Page Name]]
  // 0. The block reference
  // 1. The reference alias; i.e. Alias
  // 2. The page name from the alias expression; i.e. Page Name
  // 3. The page name from the non-alias expression; i.e. Page Name
  const pageReferenceRegex = /\[(.*)\]?\(\[\[(.*?)\]\]\)|\[\[(.*)\]\]/g;
  for (const matchingGroups of content.matchAll(pageReferenceRegex)) {
    const title = matchingGroups[2] || matchingGroups[3];
    const id =
      pageNameToIdMap.get(title) || `00000000-0000-0000-0000-000000000000`;
    const replacementHtml = `<span data-type="artifactReference" data-artifact-id="${id}" data-artifact-reference-text="${title}"></span>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

// List of properties that do not add value to the users documents
const ignoredBlockProperties = ['heading'];
// Logseq block properties are arbitrary key-value pairs determined by "property:: value" in logseq
const appendLogseqBlockProperties = (
  markdown: string,
  block: LogseqBlock,
): string => {
  if (!block.properties) return markdown;
  let propertyStr = '';
  for (const property in block.properties) {
    if (ignoredBlockProperties.includes(property)) continue;
    propertyStr += `${property}: ${block.properties[property]}\n\n`;
  }
  return propertyStr + markdown;
};

const addUniqueBlockId = (blockId: string, content: string): string => {
  // Returns three elements; ## Heading title
  // 0. The full match
  // 1. The heading elements (optional)
  // 2. The content
  const pageReferenceRegex = /^(#*) ?(.+)/g;
  for (const matchingGroups of content.matchAll(pageReferenceRegex)) {
    let replacementHtml = `<p data-id="${blockId}">${matchingGroups[2]}</p>`;
    const numOfHeadings = matchingGroups[1];
    if (numOfHeadings) {
      replacementHtml = `<h${numOfHeadings.length} data-id="${blockId}">${matchingGroups[2]}</h${numOfHeadings.length}>`;
    }
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};

const convertMarkdownToHtml = async (
  block: LogseqBlock,
  artifactId: string,
  importInfo: StandardizedImportInfo,
  blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
  baseMediaNameToPath: Map<string, string>,
  pageNameToIdMap: Map<string, string>,
): Promise<string> => {
  let markdown = block.content;
  markdown = replaceLogseqPageReferences(markdown, pageNameToIdMap);
  markdown = replaceLogseqBlockReferences(markdown, blockIdToBlockInfoMap);
  markdown = appendLogseqBlockProperties(markdown, block);
  markdown = await replaceMarkdownMediaLinks(
    markdown,
    importInfo,
    artifactId,
    baseMediaNameToPath,
  );
  markdown = await replaceMarkdownMediaTags(
    markdown,
    importInfo,
    artifactId,
    baseMediaNameToPath,
  );
  markdown = replaceBlockquotes(markdown);
  markdown = replaceHighlightedText(markdown);
  markdown = replaceCodeblocks(markdown);
  markdown = replaceInlineCode(markdown);
  markdown = replaceTables(markdown);

  const referencedBlockWithId = blockIdToBlockInfoMap.get(block.id);
  if (referencedBlockWithId) {
    markdown = addUniqueBlockId(referencedBlockWithId.id, markdown);
  }
  const html = marked.parse(markdown);
  return html;
};

const convertLogseqBlockToHtml = async (
  block: LogseqBlock,
  artifactId: string,
  pageNameToIdMap: Map<string, string>,
  blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
  importInfo: StandardizedImportInfo,
  baseMediaNameToPath: Map<string, string>,
): Promise<string> => {
  switch (block.format) {
    case 'markdown':
      return convertMarkdownToHtml(
        block,
        artifactId,
        importInfo,
        blockIdToBlockInfoMap,
        baseMediaNameToPath,
        pageNameToIdMap,
      );
    case 'org':
      return block.content; // TODO: Implement org mode support https://github.com/FeyNote/FeyNote/issues/846
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
  baseMediaNameToPath: Map<string, string>,
): Promise<string> => {
  let htmlPage = ``;
  for (const block of blocks) {
    htmlPage += await convertLogseqBlockToHtml(
      block,
      artifactId,
      pageNameToIdMap,
      blockIdToBlockInfoMap,
      importInfo,
      baseMediaNameToPath,
    );
    if (block.children.length) {
      htmlPage += `<div data-content-type="blockGroup">${await convertLogseqPageToHtml(block.children, artifactId, pageNameToIdMap, blockIdToBlockInfoMap, importInfo, baseMediaNameToPath)}</div>`;
    }
  }
  return htmlPage;
};

const handleLogseqGraph = async (args: {
  importInfo: StandardizedImportInfo;
  json: LogseqGraph;
  job: JobSummary;
  baseMediaNameToPath: Map<string, string>;
  progressTracker: JobProgressTracker;
}) => {
  const pageNameToIdMap = new Map<string, string>();
  for (const page of args.json.blocks) {
    // TODO: Implement Logseq Whiteboards https://github.com/FeyNote/FeyNote/issues/845
    if (page.properties?.['ls-type'] === 'whiteboard-page') continue;
    const title = page['page-name'];
    const id = (await getSafeArtifactId()).id;
    pageNameToIdMap.set(title, id);
  }

  const blockIdToBlockInfoMap = getLogseqReferenceIdToBlockMap({
    pages: args.json.blocks,
    pageNameToIdMap: pageNameToIdMap,
  });

  for (let i = 0; i < args.json.blocks.length; i++) {
    const page = args.json.blocks[i];
    // TODO: Implement Logseq Whiteboards https://github.com/FeyNote/FeyNote/issues/845
    if (page.properties?.['ls-type'] === 'whiteboard-page') continue;
    const id =
      pageNameToIdMap.get(page['page-name']) || (await getSafeArtifactId()).id;
    const html = await convertLogseqPageToHtml(
      page.children,
      id,
      pageNameToIdMap,
      blockIdToBlockInfoMap,
      args.importInfo,
      args.baseMediaNameToPath,
    );
    const extensions = getTiptapServerExtensions({});
    const tiptap = generateJSON(html, extensions);
    addMissingBlockIds(tiptap);
    const text = getTextForJSONContent(tiptap);

    const icon = page.properties?.icon ? page.properties.icon + ' ' : '';
    const title = icon + page['page-name'];
    const yDoc = constructYArtifact({
      id,
      userId: args.job.userId,
      title,
      theme: ArtifactTheme.default,
      type: ArtifactType.tiptap,
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

    args.importInfo.artifactsToCreate.push({
      id,
      userId: args.job.userId,
      jobId: args.job.id,
      title,
      type: ArtifactType.tiptap,
      text,
      json: tiptap,
      yBin,
    });

    const progress = Math.floor((i / args.json.blocks.length) * 100);
    args.progressTracker.onProgress({
      progress,
      step: 1,
    });
  }
};

export const logseqToStandardizedImport = async (args: {
  job: JobSummary;
  filePaths: string[];
  progressTracker: JobProgressTracker;
}): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    mediaFilesToUpload: [],
  };
  const baseMediaNameToPath = new Map<string, string>();
  for await (const filePath of args.filePaths) {
    if (extname(filePath) !== '.json') {
      baseMediaNameToPath.set(basename(filePath), filePath);
    }
  }

  for await (const filePath of args.filePaths) {
    if (extname(filePath) === '.json') {
      const json = JSON.parse(await readFile(filePath, 'utf-8')) as LogseqGraph;
      await handleLogseqGraph({
        importInfo,
        json,
        job: args.job,
        baseMediaNameToPath,
        progressTracker: args.progressTracker,
      });
      break;
    }
  }
  return importInfo;
};
