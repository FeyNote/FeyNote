import { applyUpdate, encodeStateAsUpdate } from 'yjs';
import { generateJSON } from '@tiptap/html';
import {
  ArtifactAccessLevel,
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
import { getObsidianReferenceId } from './getObsidianReferenceId';
import { replaceObsidianReferences } from './replaceObsidianReferences';
import { replaceObsidianHeadingReferences } from './replaceObsidianHeadingReferences';
import { replaceObsidianMediaTags } from './replaceObsidianMediaTags';
import { pushImgTagsToNewLine } from './pushImgTagsToNewLine';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';
import { getSafeArtifactId } from '@feynote/api-services';
import { replaceObsidianParagraphReferences } from './replaceObsidianParagraphReferences';
import { populateHeadingBlockIds } from './populateHeadingBlockIds';

export const obsidianToStandardizedImport = async (
  userId: string,
  filePaths: string[],
): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    mediaFilesToUpload: [],
  };

  // Find the path to base level of obsidian vault (what folders need to be navigated to reach the .obsidian folder)
  const obsidianConfigDirPath = filePaths.find((filePath) =>
    filePath.includes('.obsidian'),
  );
  if (!obsidianConfigDirPath)
    throw Error('No .obsidian folder found in the zip file');
  const pathToObsidianVaultDir = path.join(
    ...obsidianConfigDirPath.split(path.sep).slice(0, -1),
  );

  const referenceIdToInfoMap = new Map<
    string,
    {
      id: string;
      blockId?: string;
    }
  >();

  // Due to obsidian having two different ways in which heading references can be shown we must preprocess the
  // block ids to all heading references
  for await (const filePath of filePaths) {
    if (extname(filePath) !== '.md') continue;
    const markdown = await readFile(filePath, 'utf-8');
    const obsidianReferenceId = getObsidianReferenceId(
      filePath,
      pathToObsidianVaultDir,
    );
    const artifactId =
      referenceIdToInfoMap.get(obsidianReferenceId)?.id ??
      (await getSafeArtifactId()).id;
    referenceIdToInfoMap.set(obsidianReferenceId, {
      id: artifactId,
    });
    populateHeadingBlockIds(
      markdown,
      referenceIdToInfoMap,
      obsidianReferenceId,
      artifactId,
    );
  }

  for await (const filePath of filePaths) {
    if (extname(filePath) !== '.md') continue;
    const obsidianReferenceId = getObsidianReferenceId(
      filePath,
      pathToObsidianVaultDir,
    );
    const artifactId =
      referenceIdToInfoMap.get(obsidianReferenceId)?.id ??
      (await getSafeArtifactId()).id;
    referenceIdToInfoMap.set(obsidianReferenceId, {
      id: artifactId,
    });
    let markdown = await readFile(filePath, 'utf-8');
    markdown = pushImgTagsToNewLine(markdown);
    markdown = await replaceObsidianReferences(
      markdown,
      referenceIdToInfoMap,
      artifactId,
      pathToObsidianVaultDir,
      importInfo,
    );
    markdown = replaceObsidianHeadingReferences(
      markdown,
      referenceIdToInfoMap,
      obsidianReferenceId,
    );
    markdown = replaceObsidianParagraphReferences(
      markdown,
      artifactId,
      referenceIdToInfoMap,
      obsidianReferenceId,
    );
    markdown = await replaceObsidianMediaTags(
      markdown,
      artifactId,
      importInfo,
      pathToObsidianVaultDir,
    );
    const html = await marked.parse(markdown);
    const extensions = getTiptapServerExtensions({});
    const tiptap = generateJSON(html, extensions);
    addMissingBlockIds(tiptap);

    const text = getTextForJSONContent(tiptap);
    const title = parse(filePath).name;
    const fileId = await getSafeArtifactId();

    const yDoc = constructYArtifact({
      id: fileId.id,
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
      id: artifactId,
      userId,
      title,
      type: ArtifactType.tiptap,
      text,
      json: tiptap,
      yBin,
    });
  }
  return importInfo;
};
