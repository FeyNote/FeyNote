import { readFile } from "fs/promises";
import { ArtifactTheme, ArtifactType, type Prisma } from "@prisma/client";
import { ARTIFACT_TIPTAP_BODY_KEY, constructYArtifact, getTextForJSONContent, getTiptapServerExtensions } from "@feynote/shared-utils";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { applyUpdate, encodeStateAsUpdate } from "yjs";
import { basename, extname } from "path";
import type { StandardizedImportInfo } from "../StandardizedImportInfo";
import marked from 'marked';
import { generateJSON } from "@tiptap/core";
import { randomUUID } from "crypto";
import { isImagePath } from "../utils/isImagePath";
import { replaceImageHttpTags } from "../utils/replaceImageHttpTags";

interface LogseqBlock {
  id: string,
  content: string,
  format: 'markdown' | 'org',
  children: LogseqBlock[],
}

interface LogseqPage {
  id: string,
  'page-name': string,
  children: LogseqBlock[],
}

interface LogseqGraph {
  version: number,
  blocks: LogseqPage[],
}

export const logseqToStandardizedImport = async (
  userId: string,
  filePaths: string[],
): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    imageFilesToUpload: [],
  }
  const imagePathToId = new Map<string, string>();
  for await (const filePath of filePaths) {
    if (isImagePath(filePath)) {
      imagePathToId.set(filePath, randomUUID());
    }
  }

  for await (const filePath of filePaths) {
    if (extname(filePath) === '.json') {
      const json = JSON.parse(await readFile(filePath, 'utf-8')) as LogseqGraph;
      handleLogseqGraph(importInfo, json, userId);
      break;
    }
  }
  return importInfo
}

const handleLogseqGraph = async (
  importInfo: StandardizedImportInfo,
  json: LogseqGraph,
  userId: string,
) => {
  const pageNameToIdMap = new Map<string, string>();
  const blockIdToLogseqBlockMap = new Map<string, LogseqBlock>();
  for (const page of json.blocks) {
    const title = page['page-name'];
    const id = page.id;
    pageNameToIdMap.set(title, id);
  }

  for (const page of json.blocks) {
    const title = page['page-name'];
    const id = page.id;
    const html = await convertLogseqPageToHtml(page.children, id, pageNameToIdMap, blockIdToLogseqBlockMap, importInfo);

    const extensions = getTiptapServerExtensions();
    const tiptap = generateJSON(html, extensions);
    const text = getTextForJSONContent(tiptap);
    const yDoc = constructYArtifact({
      title,
      theme: ArtifactTheme.default,
      type: ArtifactType.tiptap,
      titleBodyMerge: true,
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
}

const convertLogseqPageToHtml = async (
  blocks: LogseqBlock[],
  artifactId: string,
  pageNameToIdMap: Map<string, string>,
  blockIdToLogseqBlockMap: Map<string, LogseqBlock>,
  importInfo: StandardizedImportInfo,
): Promise<string> => {
  let htmlPage = ``
  for (const block of blocks) {
    htmlPage += await convertLogseqBlockToHtml(block, artifactId, pageNameToIdMap, blockIdToLogseqBlockMap, importInfo);
    if (block.children.length) {
      htmlPage += `<div data-content-type="blockGroup">${await convertLogseqPageToHtml(block.children, artifactId, pageNameToIdMap, blockIdToLogseqBlockMap, importInfo)}</div>`
    }
  }
  return htmlPage;
}

const convertLogseqBlockToHtml = async (
  block: LogseqBlock,
  artifactId: string,
  pageNameToIdMap: Map<string, string>,
  blockIdToLogseqBlockMap: Map<string, LogseqBlock>,
  importInfo: StandardizedImportInfo,
): Promise<string> => {
  const content = replacePageReferences(block.content, pageNameToIdMap)
  switch (block.format) {
    case 'markdown':
      return convertMarkdownToHtml(content, artifactId, importInfo);
    case 'org':
      return content; // TODO FIX
    default:
      throw new Error(`Unrecognized block format: ${block.format}`);
  }
}

const replacePageReferences = (
  content: string,
  pageNameToIdMap: Map<string, string>,
): string => {
  // Returns two elements (the match and the src url) i.e. <img src="file.png" />
  // 1. The full page reference; i.e. [[Page Name]]
  // 2. The page name
  const pageReferenceRegex = /\[\[(.*?)\]\]/g
  for (const matchingGroups of content.matchAll(pageReferenceRegex)) {
    const title = matchingGroups[1];
    const id = pageNameToIdMap.get(title) || `00000000-0000-0000-0000-000000000000`
    const replacementHtml = `<span data-type="artifactReference" data-artifact-id="${id}" data-artifact-reference-text="${title}"></span>`;
    content.replace(matchingGroups[0], replacementHtml);
  }
  return content
}

const convertMarkdownToHtml = async (markdown: string, artifactId: string, importInfo: StandardizedImportInfo): Promise<string> => {
    markdown = replaceImageHttpTags(markdown, artifactId, importInfo);
    markdown = replaceLogseqImageReferences(markdown, importInfo, artifactId);
    const html = marked.parse(markdown);
    return html
}


const replaceLogseqImageReferences = (content: string, importInfo: StandardizedImportInfo, artifactId: string): string => {
  /**
    * Returns five matching elements
    * 0. The full match in format either <img src="file.png" /> or ![Title](path.png)
    * 1. The full match in format <img src="file.png" />
    * 2. The src url in format file.png
    * 3. The full match in format ![Title](path.png)
    * 4. The src url in format path.png
  */
  const imgRegex = /(<img src="(.*?)".*?\/>)|(\!\[.*?\]\((.*?)\))/g
  for (const matchingGroups of content.matchAll(imgRegex)) {
    const imageSrc = matchingGroups[2] || matchingGroups[4]
    if (imageSrc.startsWith('http')) continue
    const id = randomUUID();
    importInfo.imageFilesToUpload.push({
      id,
      associatedArtifactId: artifactId,
      path: basename(imageSrc),
    })
    const replacementHtml = `<img fileId="${id}" />`;
    content = content.replace(matchingGroups[1] || matchingGroups[3], replacementHtml);
  }
  return content
}
