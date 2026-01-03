import type { JobSummary } from '@feynote/prisma/types';
import type { JobProgressTracker } from '../JobProgressTracker';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { JSDOM } from 'jsdom';
import path, { join, normalize, relative, sep } from 'path';
import {
  convertFile,
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
import { tmpdir } from 'os';
import { rm, mkdir, readFile, copyFile, mkdtemp } from 'fs/promises';
import { updateHeaderDataId } from './html/updateHeaderDataId';
import { replaceBlockquotes } from './html/replaceBlockquotes';
import { updateReferencedAnchors } from './html/updateReferencedAnchors';
import type { ArtifactBlockInfo } from './ArtifactBlockInfo';
import { updateDocxBookmarks } from './html/updateDocxBookmarks';
import { populateHeadersToBlockInfoMap } from './html/populateHeadersToBlockInfoMap';
import { populateBookmarksToBlockInfoMap } from './html/populateBookmarksToBlockInfoMap';
import { extractFilesFromZip } from './extractFilesFromZip';
import { isAudioPath } from './isAudioPath';
import { isVideoPath } from './isVideoPath';
import { isImagePath } from './isImagePath';

export const docxToStandardizedImport = async (args: {
  job: JobSummary;
  filePaths: string[];
  extractDest: string,
  progressTracker: JobProgressTracker;
}): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    mediaFilesToUpload: [],
  };

  const convertedFilePaths: string[] = [];

  const tempDir = tmpdir();
  const outputDir = join(tempDir, `${Date.now()}-${crypto.randomUUID()}`);
  await mkdir(outputDir);
  for await (const docxPath of args.filePaths) {
    if (path.extname(docxPath) !== '.docx') continue;

    const convertedFilePath = await convertFile({
      inputFilePath: docxPath,
      outputDir,
      inputFormat: FileFormat.Docx,
      outputFormat: FileFormat.Html,
    }).catch((e) => {
      Sentry.captureException(e, {
        extra: {
          userId: args.job.userId,
          jobId: args.job.id,
          fileBaseName: path.basename(docxPath),
        },
      });
      throw new Error(e);
    });
    convertedFilePaths.push(convertedFilePath);
  }

  const baseMediaNameToPath = new Map<string, string>();
  const titleToArtifactIdMap = new Map<string, string>();
  const idToBlockInfo = new Map<string, ArtifactBlockInfo>();
  // Must preprocess references to get the correct reference text for artifact block replacements
  for await (const docxPath of convertedFilePaths) {
    if (path.extname(docxPath) !== '.docx') continue;
    const basename = path.basename(docxPath);
    // Populate ArtifactId Map
    const title = path.parse(basename).name;
    const artifactId = (await getSafeArtifactId()).id;
    titleToArtifactIdMap.set(title, artifactId);

    // Populate BlockId Map
    const html = await readFile(docxPath, 'utf-8');
    const jsdom = new JSDOM(html);
    populateHeadersToBlockInfoMap(
      jsdom,
      idToBlockInfo,
      artifactId,
    );
    populateBookmarksToBlockInfoMap(
      jsdom,
      idToBlockInfo,
      artifactId,
    );

    // Populate The BaseMedia Map
    const docTempPath = await mkdtemp(join(args.extractDest, sep));
    const filePaths = await extractFilesFromZip(docxPath, docTempPath);
    for await (const filePath of filePaths) {
      if (!isAudioPath(filePath) && !isVideoPath(filePath) && !isImagePath(filePath)) continue;
        const relativePath = normalize(filePath).replace(join(normalize(docTempPath), 'word', sep), '')
        baseMediaNameToPath.set(`${artifactId}-${relativePath}`, filePath);
    }
  }

  for (let i = 0; i < convertedFilePaths.length; i++) {
    const docxPath = convertedFilePaths[i];
    if (path.extname(docxPath) !== '.docx') {
      continue
    }
    const basename = path.basename(docxPath);
    const title = path.parse(basename).name;
    const artifactId = titleToArtifactIdMap.get(title);
    if (!artifactId) continue
    let html = await readFile(docxPath, 'utf-8');
    console.log('\n\npre processed html:\n', html, '\n\n')

    const jsdom = new JSDOM(html);
    replaceBlockquotes(jsdom);
    updateHeaderDataId(jsdom, idToBlockInfo, artifactId);
    updateDocxBookmarks(jsdom, idToBlockInfo, artifactId);
    updateReferencedAnchors(jsdom, idToBlockInfo, artifactId);
    html = jsdom.window.document.documentElement.outerHTML;

    console.log('\n\npost processed html:\n', html, '\n\n')

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
      step: 1,
    });
  }

  await rm(outputDir, { recursive: true });
  return importInfo;
};
