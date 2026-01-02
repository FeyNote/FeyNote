import type { JobSummary } from '@feynote/prisma/types';
import type { JobProgressTracker } from '../JobProgressTracker';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { JSDOM } from 'jsdom';
import path, { join } from 'path';
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
import { rm, mkdir, readFile } from 'fs/promises';
import { updateIdsOnHeaders } from './html/updateIdsOnHeaders';
import { replaceBlockquotes } from './html/replaceBlockquotes';
import { updateReferencedHeaders } from './html/updateReferencedHeaders';
import type { ArtifactBlockInfo } from './ArtifactBlockInfo';

export const docxToStandardizedImport = async (args: {
  job: JobSummary;
  filePaths: string[];
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
  for await (const filePath of args.filePaths) {
    if (path.extname(filePath) !== '.docx') continue;

    const convertedFilePath = await convertFile({
      inputFilePath: filePath,
      outputDir,
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
      throw new Error(e);
    });
    convertedFilePaths.push(convertedFilePath);
  }

  for (let i = 0; i < convertedFilePaths.length; i++) {
    const filePath = convertedFilePaths[i];
    const basename = path.basename(filePath);
    const artifactId = (await getSafeArtifactId()).id;
    let html = await readFile(filePath, 'utf-8');
    const jsdom = new JSDOM(html);
    const idToBlockInfo = new Map<string, ArtifactBlockInfo>();
    replaceBlockquotes(jsdom);
    updateIdsOnHeaders(jsdom, idToBlockInfo, artifactId);
    updateReferencedHeaders(jsdom, idToBlockInfo);
    html = jsdom.window.document.documentElement.outerHTML;

    const title = path.parse(basename).name;

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
