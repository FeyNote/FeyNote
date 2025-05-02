import path from 'path';
import { retrieveMediaAttributesFromTag } from '../retrieveMediaAttributesFromTag';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';
import { performMediaReplacement } from '../performMediaReplacement';

export const replaceObsidianMediaTags = async (
  content: string,
  artifactId: string,
  importInfo: StandardizedImportInfo,
  pathToObsidianVaultDir: string,
): Promise<string> => {
  // Returns two elements; i.e. <img src="file.png" />
  // 0. The full match
  // 1. The html tag
  const mediaRegex = /<(img|video|audio).*?\/>/g;
  for (const matchingGroups of content.matchAll(mediaRegex)) {
    const match = matchingGroups[0];
    const tagAttributes = retrieveMediaAttributesFromTag(match);
    if (!tagAttributes) continue;

    const src = tagAttributes.src.startsWith('http')
      ? tagAttributes.src
      : path.join('/' + pathToObsidianVaultDir, tagAttributes.src);
    if (!src) continue;
    content = await performMediaReplacement({
      match: matchingGroups[0],
      src,
      tag: matchingGroups[1],
      importInfo,
      content,
      artifactId,
      title: tagAttributes.title,
      alt: tagAttributes.alt,
    });
  }

  return content;
};
