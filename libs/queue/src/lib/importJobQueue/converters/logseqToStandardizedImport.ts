import { readFile } from "fs/promises";
import { ArtifactTheme, ArtifactType, type Prisma } from "@prisma/client";
import { ARTIFACT_TIPTAP_BODY_KEY, constructYArtifact, getTextForJSONContent, getTiptapServerExtensions } from "@feynote/shared-utils";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { applyUpdate, encodeStateAsUpdate } from "yjs";
import { extname } from "path";
import type { StandardizedImportInfo } from "../StandardizedImportInfo";

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
  for (const page of json.blocks) {
    const title = page['page-name'];
    const id = page.id;
    const tiptap = await convertLogseqPageToTiptap(page.children);

    const extensions = getTiptapServerExtensions();
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

const convertLogseqPageToTiptap = async (blocks: LogseqBlock[]): Promise<Record<string, any>> => {
  const tiptapBlocks: Record<string, any> = {};
  for (const block of blocks) {
    const tiptapBlock = convertLogseqBlockToTiptap(block);
    tiptapBlock["content"] = await convertLogseqPageToTiptap(block.children);
    tiptapBlocks[block.id] = tiptapBlock;
  }
  return tiptapBlocks;
}

const convertLogseqBlockToTiptap = (block: LogseqBlock): Record<string, any> => {
  switch (block.format) {
    case 'markdown':
      return convertMarkdownToTiptap(block.content);
    case 'org':
      return convertOrgToTiptap(block.content);
    default:
      throw new Error(`Unrecognized block format: ${block.format}`);
  }
}

const convertMarkdownToTiptap = (markdown: string): Record<string, any> => {

}

const convertOrgToTiptap = (markdown: string): Record<string, any> => {

}
