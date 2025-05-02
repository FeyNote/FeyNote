import { generateS3Key, getSafeFileId } from '@feynote/api-services';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import type { FeynoteEditorMediaType } from '@feynote/shared-utils';

export const performMediaReplacement = async (args: {
  match: string;
  src: string;
  fileType: FeynoteEditorMediaType;
  importInfo: StandardizedImportInfo;
  content: string;
  artifactId: string;
  title?: string;
  alt?: string;
}): Promise<string> => {
  const { match, src, fileType, artifactId, importInfo, content, title, alt } =
    args;
  const id = (await getSafeFileId()).id;
  const storageKey = generateS3Key();
  if (src.startsWith('http')) {
    importInfo.mediaFilesToUpload.push({
      id,
      url: src,
      associatedArtifactId: artifactId,
      storageKey,
    });
  } else {
    importInfo.mediaFilesToUpload.push({
      id,
      associatedArtifactId: artifactId,
      path: src,
      storageKey,
    });
  }

  const replacementHtml = `<div data-media-type="${fileType}" data-fallback="${src}" data-file-id="${id}" data-storage-key="${storageKey}" data-title="${title}" data-alt="${alt}" />`;
  return content.replace(match, `\n\n${replacementHtml}\n\n`);
};
