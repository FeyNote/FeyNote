import { isImagePath } from '../isImagePath';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';
import path from 'path';
import { FeynoteEditorMediaType } from '@feynote/shared-utils';
import { isVideoPath } from '../isVideoPath';
import { isAudioPath } from '../isAudioPath';
import { performMediaReplacement } from '../performMediaReplacement';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export const replaceObsidianReferences = async (
  markdown: string,
  artifactId: string,
  importInfo: StandardizedImportInfo,
  baseMediaNameToPath: Map<string, string>,
  referenceIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
  titleToArtifactIdMap: Map<string, string>,
  obsidianFileId: string,
): Promise<string> => {
  // Returns four elements (the match and three matching groups) for each artifact references; i.e. ![[Doc Path#Header Id|Display Text]]
  // 0. The full match
  // 1. The document path
  // 2. The Heading Text i.e. #Heading One
  // 3. The Block Id i.e. ^a8eac6
  // 4. The |display text (Not used)
  const referenceRegex = /!?\[\[(.*?)(#.*?)?(\^.*?)?(\|.*?)?\]\]/g;
  for (const matchingGroups of markdown.matchAll(referenceRegex)) {
    const documentReference = matchingGroups[1];
    if (
      baseMediaNameToPath.has(documentReference) ||
      documentReference.startsWith('http')
    ) {
      // Either a file path or a URL
      const src =
        baseMediaNameToPath.get(documentReference) || documentReference;
      let fileType = FeynoteEditorMediaType.Generic;
      if (isVideoPath(src)) fileType = FeynoteEditorMediaType.Video;
      else if (isImagePath(src)) fileType = FeynoteEditorMediaType.Image;
      else if (isAudioPath(src)) fileType = FeynoteEditorMediaType.Audio;

      const title = path.basename(src);
      const alt = matchingGroups[4] || title;
      markdown = await performMediaReplacement({
        match: matchingGroups[0],
        src: src,
        fileType,
        importInfo,
        content: markdown,
        artifactId,
        title,
        alt,
      });
      continue;
    }

    // If the document reference does not exist then its a local reference and need to add the local title
    const fileId = documentReference || obsidianFileId;
    const headerId = fileId + matchingGroups[2];
    const blockId = fileId + matchingGroups[3];
    const blockInfo =
      referenceIdToBlockInfoMap.get(blockId) ||
      referenceIdToBlockInfoMap.get(headerId);
    const brokenReferenceId = `00000000-0000-0000-0000-000000000000`;
    if (blockInfo) {
      const blockInfo = referenceIdToBlockInfoMap.get(blockId);
      const replacementHtml = `<span data-type="artifactReference" data-artifact-block-id=${blockInfo?.id || brokenReferenceId} data-artifact-id="${blockInfo?.artifactId || brokenReferenceId}" data-artifact-reference-text="${blockInfo?.referenceText || documentReference}"></span>`;
      markdown = markdown.replace(matchingGroups[0], replacementHtml);
    } else {
      const referencedArtifactId = titleToArtifactIdMap.get(documentReference);
      let replacementHtml = `<span>${documentReference}</span>`;
      if (referencedArtifactId) {
        replacementHtml = `<span data-type="artifactReference" data-artifact-id="${referencedArtifactId}" data-artifact-reference-text="${documentReference}"></span>`;
      }
      markdown = markdown.replace(matchingGroups[0], replacementHtml);
    }
  }
  return markdown;
};
