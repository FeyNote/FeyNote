import { applyUpdate, encodeStateAsUpdate } from 'yjs';
import { generateJSON } from '@tiptap/html';
import {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import { readFile } from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import {
  addMissingBlockIds,
  ARTIFACT_TIPTAP_BODY_KEY,
  constructYArtifact,
  getTextForJSONContent,
  getTiptapServerExtensions,
} from '@feynote/shared-utils';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { replaceObsidianReferences } from './replaceObsidianReferences';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';
import { getSafeArtifactId } from '@feynote/api-services';
import { populateBlockIdToBlockInfoMap } from './populateBlockIdToBlockInfoMap';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';
import { replaceMarkdownMediaLinks } from '../replaceMarkdownMediaLinks';
import { replaceMarkdownMediaTags } from '../replaceMarkdownMediaTags';
import { addBlockIdsToReferencedBlockIds } from './addBlockIdsToReferencedBlockIds';
import { addBlockIdsToReferencedHeaders } from './addBlockIdsToReferencedHeaders';
import { populateHeadersToBlockInfoMap } from './populateHeadersToBlockInfoMap';
import { replaceObsidianReferencedHeadings } from './replaceObsidianReferencedHeadings';
import type { JobProgressTracker } from '../../JobProgressTracker';
import type { JobSummary } from '@feynote/prisma/types';

export const obsidianToStandardizedImport = async (args: {
  job: JobSummary;
  filePaths: string[];
  progressTracker: JobProgressTracker;
}): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    mediaFilesToUpload: [],
  };

  const titleToArtifactIdMap = new Map<string, string>();
  const baseMediaNameToPath = new Map<string, string>();
  const referenceIdToBlockInfoMap = new Map<string, ArtifactBlockInfo>();
  // Must preprocess references to get the correct reference text for artifact block replacements
  for (const filePath of args.filePaths) {
    const basename = path.basename(filePath);
    if (path.extname(filePath) !== '.md') {
      baseMediaNameToPath.set(basename, filePath);
      continue;
    }
    const title = path.parse(basename).name;
    const markdown = await readFile(filePath, 'utf-8');
    const artifactId = (await getSafeArtifactId()).id;
    titleToArtifactIdMap.set(title, artifactId);
    populateBlockIdToBlockInfoMap(
      markdown,
      referenceIdToBlockInfoMap,
      artifactId,
      title,
    );
    populateHeadersToBlockInfoMap(
      markdown,
      referenceIdToBlockInfoMap,
      artifactId,
      title,
    );
  }

  for (let i = 0; i < args.filePaths.length; i++) {
    const filePath = args.filePaths[i];
    const basename = path.basename(filePath);
    if (path.extname(filePath) !== '.md') continue;
    const title = path.parse(basename).name;
    const artifactId = titleToArtifactIdMap.get(title);
    if (!artifactId) continue;

    let markdown = await readFile(filePath, 'utf-8');
    markdown = await replaceObsidianReferences(
      markdown,
      artifactId,
      importInfo,
      baseMediaNameToPath,
      referenceIdToBlockInfoMap,
      titleToArtifactIdMap,
      title,
    );
    markdown = await replaceMarkdownMediaLinks(
      markdown,
      importInfo,
      artifactId,
      baseMediaNameToPath,
    );
    markdown = await replaceMarkdownMediaTags(
      markdown,
      importInfo,
      artifactId,
      baseMediaNameToPath,
    );
    markdown = replaceObsidianReferencedHeadings(
      markdown,
      referenceIdToBlockInfoMap,
      title,
    );
    markdown = addBlockIdsToReferencedBlockIds(
      markdown,
      referenceIdToBlockInfoMap,
      title,
    );
    markdown = addBlockIdsToReferencedHeaders(
      markdown,
      referenceIdToBlockInfoMap,
      title,
    );
    const html = await marked.parse(markdown);
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
  return importInfo;
};
