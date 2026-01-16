import { FeynoteEditorMediaType } from '@feynote/shared-utils';
import { type JSDOM } from 'jsdom';
import { isVideoPath } from '../isVideoPath';
import { isImagePath } from '../isImagePath';
import { isAudioPath } from '../isAudioPath';
import path from 'path';
import { generateS3Key, getSafeFileId } from '@feynote/api-services';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';

export async function updateMediaLinks(
  jsdom: JSDOM,
  artifactId: string,
  importInfo: StandardizedImportInfo,
  outputDir: string,
) {
  const mediaEls = jsdom.window.document.querySelectorAll('img,video,audio');
  for await (const mediaEl of mediaEls) {
    const src = mediaEl.getAttribute('src');
    if (!src) return;

    const id = (await getSafeFileId()).id;
    const storageKey = generateS3Key();

    if (src.startsWith('http')) {
      importInfo.mediaFilesToUpload.push({
        id,
        url: src,
        associatedArtifactId: artifactId,
        storageKey,
      });
    } else if (src.startsWith(outputDir)) {
      importInfo.mediaFilesToUpload.push({
        id,
        associatedArtifactId: artifactId,
        path: src,
        storageKey,
      });
    }

    let fileType = FeynoteEditorMediaType.Generic;
    if (isVideoPath(src)) fileType = FeynoteEditorMediaType.Video;
    else if (isImagePath(src)) fileType = FeynoteEditorMediaType.Image;
    else if (isAudioPath(src)) fileType = FeynoteEditorMediaType.Audio;

    const title = path.basename(src);
    const alt = mediaEl.getAttribute('alt') || title;

    const newMediaSpan = jsdom.window.document.createElement('span');
    newMediaSpan.setAttribute('data-file-type', fileType);
    newMediaSpan.setAttribute('data-file-id', id);
    newMediaSpan.setAttribute('data-storage-key', storageKey);
    newMediaSpan.setAttribute('data-title', title);
    newMediaSpan.setAttribute('data-alt', alt);

    mediaEl.parentNode?.replaceChild(newMediaSpan, mediaEl);
  }
}
