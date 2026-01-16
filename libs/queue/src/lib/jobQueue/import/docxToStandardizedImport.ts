import type { JobSummary } from '@feynote/prisma/types';
import type { JobProgressTracker } from '../JobProgressTracker';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { JSDOM } from 'jsdom';
import path from 'path';
import {
  convertFileWithPandoc,
  FileFormat,
  getSafeArtifactId,
} from '@feynote/api-services';
import {
  addMissingBlockIds,
  ARTIFACT_TIPTAP_BODY_KEY,
  constructYArtifact,
  getTextForJSONContent,
  getTiptapServerExtensions,
} from '@feynote/shared-utils';
import { generateJSON } from '@tiptap/html';
import {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { applyUpdate, encodeStateAsUpdate } from 'yjs';
import * as Sentry from '@sentry/node';
import { readFile } from 'fs/promises';
import { updateHeaderDataId } from './html/updateHeaderDataId';
import { replaceBlockquotes } from './html/replaceBlockquotes';
import { updateReferencedAnchors } from './html/updateReferencedAnchors';
import type { ArtifactBlockInfo } from './ArtifactBlockInfo';
import { updateDocxBookmarks } from './html/updateDocxBookmarks';
import { populateHeadersToBlockInfoMap } from './html/populateHeadersToBlockInfoMap';
import { populateBookmarksToBlockInfoMap } from './html/populateBookmarksToBlockInfoMap';
import { updateMediaLinks } from './html/updateMediaLinks';

export const docxToStandardizedImport = async (args: {
  job: JobSummary;
  filePaths: string[];
  tempWorkingDir: string;
  progressTracker: JobProgressTracker;
}): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    mediaFilesToUpload: [],
  };

  const convertedFilePaths: string[] = [];

  for (let i = 0; i < args.filePaths.length; i++) {
    const filePath = args.filePaths[i];
    if (path.extname(filePath) !== '.docx') continue;

    const convertedFilePath = await convertFileWithPandoc({
      inputFilePath: filePath,
      outputDir: args.tempWorkingDir,
      inputFormat: FileFormat.Docx,
      outputFormat: FileFormat.Html,
    }).catch((e) => {
      Sentry.captureException(e, {
        extra: {
          userId: args.job.userId,
          jobId: args.job.id,
          fileBaseName: path.basename(filePath),
        },
      });
      throw e;
    });

    args.progressTracker.onProgress({
      progress: Math.floor((i / args.filePaths.length) * 100),
      step: 1,
    });
    convertedFilePaths.push(convertedFilePath);
  }

  const titleToArtifactIdMap = new Map<string, string>();
  const idToBlockInfo = new Map<string, ArtifactBlockInfo>();

  // Must preprocess references to get the correct reference text for artifact block replacements
  for (const docxPath of convertedFilePaths) {
    if (path.extname(docxPath) !== '.html') continue;
    const basename = path.basename(docxPath);
    // Populate ArtifactId Map
    const title = path.parse(basename).name;
    const artifactId = (await getSafeArtifactId()).id;
    titleToArtifactIdMap.set(title, artifactId);

    // Populate BlockId Map
    const html = await readFile(docxPath, 'utf-8');
    const jsdom = new JSDOM(html);
    populateHeadersToBlockInfoMap(jsdom, idToBlockInfo, artifactId);
    populateBookmarksToBlockInfoMap(jsdom, idToBlockInfo, artifactId);
  }

  for (let i = 0; i < convertedFilePaths.length; i++) {
    const docxPath = convertedFilePaths[i];
    if (path.extname(docxPath) !== '.html') {
      continue;
    }
    const basename = path.basename(docxPath);
    const title = path.parse(basename).name;
    const artifactId = titleToArtifactIdMap.get(title);
    if (!artifactId) continue;
    let html = await readFile(docxPath, 'utf-8');

    const jsdom = new JSDOM(html);
    replaceBlockquotes(jsdom);
    updateHeaderDataId(jsdom, idToBlockInfo, artifactId);
    updateDocxBookmarks(jsdom, idToBlockInfo, artifactId);
    updateReferencedAnchors(jsdom, idToBlockInfo, artifactId);
    await updateMediaLinks(jsdom, artifactId, importInfo, args.tempWorkingDir);
    html = jsdom.window.document.documentElement.outerHTML;

    const extensions = getTiptapServerExtensions({});
    const tiptap = generateJSON(html, extensions);
    addMissingBlockIds(tiptap);

    const text = getTextForJSONContent(tiptap);

    const yDoc = constructYArtifact({
      id: artifactId,
      userId: args.job.userId,
      title,
      theme: ArtifactTheme.default,
      type: ArtifactType.tiptap,
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
      userId: args.job.userId,
      title,
      type: ArtifactType.tiptap,
      text,
      json: tiptap,
      jobId: args.job.id,
      yBin,
    });
    args.progressTracker.onProgress({
      progress: Math.floor((i / args.filePaths.length) * 100),
      step: 2,
    });
  }

  return importInfo;
};
