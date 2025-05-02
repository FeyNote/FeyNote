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
  FeynoteEditorMediaType,
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
import { getSafeArtifactId } from '@feynote/api-services';
import { isVideoPath } from '../isVideoPath';
import { isAudioPath } from '../isAudioPath';
import { retrieveMediaAttributesFromTag } from '../retrieveMediaAttributesFromTag';
import { performMediaReplacement } from '../performMediaReplacement';

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

const replaceLogseqMediaTags = async (
  content: string,
  importInfo: StandardizedImportInfo,
  artifactId: string,
  baseMediaNameToPath: Map<string, string>,
): Promise<string> => {
  // Returns two elements; i.e. <img src="file.png" />
  // 0. The full match
  // 1. The html tag
  const mediaTagRegex = /<(img|video|audio).*?\/>/g;
  for (const matchingGroups of content.matchAll(mediaTagRegex)) {
    const match = matchingGroups[0];
    const tagAttributes = retrieveMediaAttributesFromTag(match);
    if (!tagAttributes) continue;

    const src = tagAttributes.src.startsWith('http')
      ? tagAttributes.src
      : baseMediaNameToPath.get(basename(tagAttributes.src));
    if (!src) continue;
    content = await performMediaReplacement({
      match: matchingGroups[0],
      src,
      fileType: matchingGroups[1] as FeynoteEditorMediaType,
      importInfo,
      content,
      artifactId,
      title: tagAttributes.title,
      alt: tagAttributes.alt,
    });
  }
  return content;
};

const replaceLogseqMediaLinks = async (
  content: string,
  importInfo: StandardizedImportInfo,
  artifactId: string,
  baseMediaNameToPath: Map<string, string>,
): Promise<string> => {
  /**
   * Returns four matching elements
   * 0. The full match in format either ![Title](path.png){} ({} is optional)
   * 1. The title in [Title]
   * 2. The src url in (path.png)
   * 3. The alt text in {alt}
   */
  const mediaLinkRegex = /!\[([^[]*?)\]\((.*?)\)({.*?})?/g;
  for (const matchingGroups of content.matchAll(mediaLinkRegex)) {
    const title = matchingGroups[1];
    const srcMatch = matchingGroups[2];
    const alt = matchingGroups[3] || title;
    if (!srcMatch) continue;
    let fileType = FeynoteEditorMediaType.Generic;
    if (isVideoPath(srcMatch)) fileType = FeynoteEditorMediaType.Video;
    else if (isImagePath(srcMatch)) fileType = FeynoteEditorMediaType.Image;
    else if (isAudioPath(srcMatch)) fileType = FeynoteEditorMediaType.Audio;

    const src = srcMatch.startsWith('http')
      ? srcMatch
      : baseMediaNameToPath.get(basename(srcMatch));
    if (!src) continue;
    content = await performMediaReplacement({
      match: matchingGroups[0],
      src,
      fileType,
      importInfo,
      content,
      artifactId,
      title,
      alt,
    });
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
  markdown = await replaceLogseqMediaLinks(
    markdown,
    importInfo,
    artifactId,
    baseMediaNameToPath,
  );
  markdown = await replaceLogseqMediaTags(
    markdown,
    importInfo,
    artifactId,
    baseMediaNameToPath,
  );
  markdown = replaceBlockquotes(markdown);
  markdown = replaceHighlightedText(markdown);
  markdown = replaceCodeblocks(markdown);
  markdown = replaceInlineCode(markdown);

  let html = marked.parse(markdown);
  const referencedBlockWithId = blockIdToBlockInfoMap.get(block.id);
  if (referencedBlockWithId) {
    html = `<p data-id="${referencedBlockWithId.id}">${html}</p>`;
  }
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
      return block.content; // TODO: Implement org mode support https://github.com/RedChickenCo/FeyNote/issues/846
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

const handleLogseqGraph = async (
  importInfo: StandardizedImportInfo,
  json: LogseqGraph,
  userId: string,
  baseMediaNameToPath: Map<string, string>,
) => {
  const pageNameToIdMap = new Map<string, string>();
  for (const page of json.blocks) {
    // TODO: Implement Logseq Whiteboards https://github.com/RedChickenCo/FeyNote/issues/845
    if (page.properties?.['ls-type'] === 'whiteboard-page') continue;
    const title = page['page-name'];
    const id = (await getSafeArtifactId()).id;
    pageNameToIdMap.set(title, id);
  }

  const blockIdToBlockInfoMap = getLogseqReferenceIdToBlockMap(
    json.blocks,
    pageNameToIdMap,
  );

  for (const page of json.blocks) {
    // TODO: Implement Logseq Whiteboards https://github.com/RedChickenCo/FeyNote/issues/845
    if (page.properties?.['ls-type'] === 'whiteboard-page') continue;
    const icon = page.properties?.icon ? page.properties.icon + ' ' : '';
    const title = icon + page['page-name'];
    if (title !== 'Contents') continue;
    console.log(`\n\nOn page name: ${title}`);
    const id = pageNameToIdMap.get(title) || (await getSafeArtifactId()).id;
    const html = await convertLogseqPageToHtml(
      page.children,
      id,
      pageNameToIdMap,
      blockIdToBlockInfoMap,
      importInfo,
      baseMediaNameToPath,
    );
    console.log(`\n\nHTML: ${html}`);
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
    mediaFilesToUpload: [],
  };
  const baseMediaNameToPath = new Map<string, string>();
  for await (const filePath of filePaths) {
    console.log(`File path: ${filePath}`);
    if (extname(filePath) !== '.json') {
      baseMediaNameToPath.set(basename(filePath), filePath);
    }
  }

  for await (const filePath of filePaths) {
    if (extname(filePath) === '.json') {
      const json = JSON.parse(await readFile(filePath, 'utf-8')) as LogseqGraph;
      await handleLogseqGraph(importInfo, json, userId, baseMediaNameToPath);
      break;
    }
  }
  return importInfo;
};
