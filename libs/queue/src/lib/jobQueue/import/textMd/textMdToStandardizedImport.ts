import type { JobSummary } from '@feynote/prisma/types';
import type { JobProgressTracker } from '../../JobProgressTracker';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';
import { basename, extname, parse } from 'path';
import { readFile } from 'fs/promises';
import {
  replaceBlockquotes,
  replaceCodeblocks,
  replaceHighlightedText,
  replaceInlineCode,
} from '../markdownConversionUtilities';
import { marked } from 'marked';
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
import { getSafeArtifactId } from '@feynote/api-services';
import { applyUpdate, encodeStateAsUpdate } from 'yjs';
import { replaceMarkdownMediaLinks } from '../replaceMarkdownMediaLinks';
import { replaceMarkdownMediaTags } from '../replaceMarkdownMediaTags';

export const textMdToStandardizedImport = async (args: {
  job: JobSummary;
  filePaths: string[];
  progressTracker: JobProgressTracker;
}): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    mediaFilesToUpload: [],
  };

  const baseMediaNameToPath = new Map<string, string>();
  for await (const filePath of args.filePaths) {
    if (extname(filePath) !== '.md' || extname(filePath) !== '.txt') {
      baseMediaNameToPath.set(basename(filePath), filePath);
    }
  }

  let i = 1;
  for await (const filePath of args.filePaths) {
    const isMarkdown = extname(filePath) === '.md';
    const id = (await getSafeArtifactId()).id;
    const title = parse(filePath).name;
    let content = await readFile(filePath, 'utf-8');
    if (isMarkdown) {
      content = await replaceMarkdownMediaLinks(
        content,
        importInfo,
        id,
        baseMediaNameToPath,
      );
      content = await replaceMarkdownMediaTags(
        content,
        importInfo,
        id,
        baseMediaNameToPath,
      );
      content = replaceBlockquotes(content);
      content = replaceHighlightedText(content);
      content = replaceCodeblocks(content);
      content = replaceInlineCode(content);
    }

    const html = await marked.parse(content);
    const extensions = getTiptapServerExtensions({});
    const tiptap = generateJSON(html, extensions);
    addMissingBlockIds(tiptap);
    const text = getTextForJSONContent(tiptap);

    const yDoc = constructYArtifact({
      id,
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
      id,
      userId: args.job.userId,
      jobId: args.job.id,
      title,
      type: ArtifactType.tiptap,
      text,
      json: tiptap,
      yBin,
    });

    const progress = Math.floor((i++ / args.filePaths.length) * 100);
    args.progressTracker.onProgress({
      progress,
      step: 1,
    });
  }
  return importInfo;
};
