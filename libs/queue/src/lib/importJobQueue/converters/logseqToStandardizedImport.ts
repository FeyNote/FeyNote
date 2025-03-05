import { readFile } from "fs/promises";
import { ArtifactTheme, ArtifactType } from "@prisma/client";
import { addMissingBlockIds, ARTIFACT_TIPTAP_BODY_KEY, constructYArtifact, getTextForJSONContent, getTiptapServerExtensions } from "@feynote/shared-utils";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { applyUpdate, encodeStateAsUpdate } from "yjs";
import { basename, extname } from "path";
import type { StandardizedImportInfo } from "../StandardizedImportInfo";
import { generateJSON } from "@tiptap/html";
import { randomUUID } from "crypto";
import { isImagePath } from "../utils/isImagePath";
import { replaceImageHttpTags } from "../utils/replaceImageHttpTags";
import type { LogseqBlock, LogseqGraph } from "../LogseqGraph";
import { marked } from 'marked';
import { getLogseqReferenceIdToBlockMap, type ArtifactBlockInfo } from "../utils/getLogseqReferenceIdToBlockMap";

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
  for (const page of json.blocks) {
    const title = page['page-name'];
    const id = randomUUID();
    pageNameToIdMap.set(title, id);
  }

  const blockIdToBlockInfoMap = getLogseqReferenceIdToBlockMap(json.blocks, pageNameToIdMap);

  for (const page of json.blocks) {
    const title = page['page-name'];
    const id = pageNameToIdMap.get(title) || randomUUID();
    const html = await convertLogseqPageToHtml(page.children, id, pageNameToIdMap, blockIdToBlockInfoMap, importInfo);
    const extensions = getTiptapServerExtensions();
    const tiptap = generateJSON(html, extensions);
    addMissingBlockIds(tiptap);
    console.log(`\n\nArtifact Titel: ${title}\nArtifact Id: ${id}\nconverted html:\n${html}\nGenerated Tiptap: ${JSON.stringify(tiptap, null, 4)}\n\n`)
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
  blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
  importInfo: StandardizedImportInfo,
): Promise<string> => {
  let htmlPage = ``
  for (const block of blocks) {
    htmlPage += await convertLogseqBlockToHtml(block, artifactId, pageNameToIdMap, blockIdToBlockInfoMap, importInfo);
    if (block.children.length) {
      htmlPage += `<div data-content-type="blockGroup">${await convertLogseqPageToHtml(block.children, artifactId, pageNameToIdMap, blockIdToBlockInfoMap, importInfo)}</div>`
    }
  }
  return htmlPage;
}

const convertLogseqBlockToHtml = async (
  block: LogseqBlock,
  artifactId: string,
  pageNameToIdMap: Map<string, string>,
  blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
  importInfo: StandardizedImportInfo,
): Promise<string> => {
  const content = replacePageReferences(block.content, pageNameToIdMap)
  switch (block.format) {
    case 'markdown':
      return convertMarkdownToHtml(content, block.id, artifactId, importInfo, blockIdToBlockInfoMap);
    case 'org':
      return content; // TODO: FIX
    default:
      throw new Error(`Unrecognized block format: ${block.format}`);
  }
}

const replacePageReferences = (
  content: string,
  pageNameToIdMap: Map<string, string>,
): string => {
  // Returns two elements (the match and the src url) i.e. <img src="file.png" />
  // 0. The full page reference; i.e. [[Page Name]]
  // 1. The page name
  const pageReferenceRegex = /\[\[(.*?)\]\]/g
  for (const matchingGroups of content.matchAll(pageReferenceRegex)) {
    const title = matchingGroups[1];
    const id = pageNameToIdMap.get(title) || `00000000-0000-0000-0000-000000000000`
    const replacementHtml = `<span data-type="artifactReference" data-artifact-id="${id}" data-artifact-reference-text="${title}"></span>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content
}

const convertMarkdownToHtml = async (
  markdown: string,
  blockId: string,
  artifactId: string,
  importInfo: StandardizedImportInfo,
  blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
): Promise<string> => {
    markdown = replaceImageHttpTags(markdown, artifactId, importInfo);
    markdown = replaceLogseqImageReferences(markdown, importInfo, artifactId);
    markdown = replaceLogseqBlockReferences(markdown, blockIdToBlockInfoMap);
    let html = marked.parse(markdown);
    const referencedBlockWithId = blockIdToBlockInfoMap.get(blockId);
    if (referencedBlockWithId) {
        html = `<span data-id="${referencedBlockWithId.id}">${html}</span>`;
    }
    return html
}

const replaceLogseqBlockReferences = (content: string, blockIdToBlockInfoMap: Map<string, ArtifactBlockInfo>): string => {
      // Returns two elements (the match and the src url) i.e. <img src="file.png" />
      // 0. The block reference; i.e. ((Block Id))
      // 1. The block id
      const pageReferenceRegex = /\(\((.*?)\)\)/g
      for (const matchingGroups of content.matchAll(pageReferenceRegex)) {
        const referencedId = matchingGroups[1];
        const blockInfo = blockIdToBlockInfoMap.get(referencedId);
        if (!blockInfo) {
          // Broken reference
          continue
        }
        const replacementHtml = `<span data-type="artifactReference" data-artifact-block-id=${blockInfo.id} data-artifact-id="${blockInfo.artifactId}" data-artifact-reference-text="${blockInfo.referenceText}"></span>`;
        content = content.replace(matchingGroups[0], replacementHtml);
      }
  return content
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
