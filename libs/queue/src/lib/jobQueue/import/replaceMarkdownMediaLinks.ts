import { FeynoteEditorMediaType } from '@feynote/shared-utils';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { isVideoPath } from './isVideoPath';
import { isImagePath } from './isImagePath';
import { isAudioPath } from './isAudioPath';
import { basename } from 'path';
import { performMediaReplacement } from './performMediaReplacement';

export const replaceMarkdownMediaLinks = async (
  content: string,
  importInfo: StandardizedImportInfo,
  artifactId: string,
  baseMediaNameToPath?: Map<string, string>,
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
      : baseMediaNameToPath?.get(basename(srcMatch));
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
