import { applyUpdate, encodeStateAsUpdate } from 'yjs';
import { generateJSON } from '@tiptap/html';
import {
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import { readFile } from 'fs/promises';
import path, { extname, parse } from 'path';
import { marked } from 'marked';
import {
    addMissingBlockIds,
  ARTIFACT_TIPTAP_BODY_KEY,
  constructYArtifact,
  getTextForJSONContent,
  getTiptapServerExtensions,
} from '@feynote/shared-utils';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { randomUUID } from 'crypto';
import { getObsidianReferenceId } from '../utils/getObsidianReferenceId';
import { replaceObsidianReferences } from '../utils/replaceObsidianReferences';
import { replaceObsidianHeadings } from '../utils/replaceObsidianHeadings';
import { replaceObsidianImageFileTags } from '../utils/replaceImageFileTags';
import { replaceImageHttpTags } from '../utils/replaceImageHttpTags';
import { pushImgTagsToNewLine } from '../utils/pushImgTagsToNewLine';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';

export const obsidianToStandardizedImport = async (
  userId: string,
  filePaths: string[],
): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    imageFilesToUpload: [],
  }

  // Find the path to base level of obsidian valut (what folders need to be navigated to reach the .obsidian folder)
  const obsidianConfigDirPath = filePaths.find((filePath) => filePath.includes('.obsidian'));
  if (!obsidianConfigDirPath) throw Error('No .obsidian folder found in the zip file');
  const pathToRelativeReferences = path.join(...obsidianConfigDirPath.split(path.sep).slice(0, -1))

  const referenceIdToInfoMap = new Map<
    string,
    {
      id: string;
      path: string;
    }
  >();
  filePaths.forEach((filePath) => {
    const obsidianReferenceId = getObsidianReferenceId(filePath, pathToRelativeReferences);
    const id = randomUUID();
    referenceIdToInfoMap.set(obsidianReferenceId, { id, path: filePath });
  })

  for await (const filePath of filePaths) {
    if (extname(filePath) !== '.md') continue;
    const obsidianReferenceId = getObsidianReferenceId(filePath, pathToRelativeReferences);
    const artifactId = referenceIdToInfoMap.get(obsidianReferenceId)?.id ?? randomUUID();

    let markdown = await readFile(filePath, 'utf-8');
    markdown = pushImgTagsToNewLine(markdown)
    markdown = replaceObsidianReferences(markdown, referenceIdToInfoMap, artifactId, importInfo);
    markdown = replaceObsidianHeadings(markdown);
    markdown = replaceObsidianImageFileTags(markdown, referenceIdToInfoMap, artifactId, importInfo);
    markdown = replaceImageHttpTags(markdown, artifactId, importInfo);

    const html = await marked.parse(markdown);
    const extensions = getTiptapServerExtensions();
    const tiptap = generateJSON(html, extensions);
    addMissingBlockIds(tiptap);

    const text = getTextForJSONContent(tiptap);
    const title = parse(filePath).name;
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
      id: artifactId,
      userId,
      title,
      type: ArtifactType.tiptap,
      text,
      json: tiptap,
      yBin,
    });
  }
  return importInfo
}
