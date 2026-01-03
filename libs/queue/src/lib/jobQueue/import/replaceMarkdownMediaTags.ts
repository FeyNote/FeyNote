import { FeynoteEditorMediaType } from '@feynote/shared-utils';
import { performMediaReplacement } from './performMediaReplacement';
import { retrieveMediaAttributesFromTag } from './retrieveMediaAttributesFromTag';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { basename } from 'path';

export const replaceMarkdownMediaTags = async (
  content: string,
  importInfo: StandardizedImportInfo,
  artifactId: string,
  baseMediaNameToPath?: Map<string, string>,
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
      : baseMediaNameToPath?.get(basename(tagAttributes.src));
    if (!src) continue;
    let fileType = matchingGroups[1];
    if (fileType === 'img') fileType = FeynoteEditorMediaType.Image;
    content = await performMediaReplacement({
      match: matchingGroups[0],
      src,
      fileType: fileType as FeynoteEditorMediaType,
      importInfo,
      content,
      artifactId,
      title: tagAttributes.title,
      alt: tagAttributes.alt,
    });
  }
  return content;
};
