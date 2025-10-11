import type { JobSummary } from "@feynote/prisma/types";
import type { JobProgressTracker } from "../JobProgressTracker";
import type { StandardizedImportInfo } from "./StandardizedImportInfo";
import { readFile } from "fs/promises";
import path from 'path';
import { getSafeArtifactId } from "@feynote/api-services";
import { marked } from "marked";
import { addMissingBlockIds, ARTIFACT_TIPTAP_BODY_KEY, constructYArtifact, getTextForJSONContent, getTiptapServerExtensions } from "@feynote/shared-utils";
import { generateJSON } from "@tiptap/core";
import { ArtifactAccessLevel, ArtifactTheme, ArtifactType } from "@prisma/client";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { applyUpdate, encodeStateAsUpdate } from "yjs";
import { replaceMarkdownMediaLinks } from "./replaceMarkdownMediaLinks";
import { replaceMarkdownMediaTags } from "./replaceMarkdownMediaTags";

export const textMdToStandardizedImport = async (args: {
  job: JobSummary;
  filePaths: string[];
  progressTracker: JobProgressTracker;
}): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    mediaFilesToUpload: [],
  };
  for (let i = 0; i < args.filePaths.length; i++) {
    const filePath = args.filePaths[i];
    const extension = path.extname(filePath)
    const basename = path.basename(filePath);
    if (extension !== '.md' && extension !== '.txt') {
      continue
    }
    let content = JSON.parse(await readFile(filePath, 'utf-8'));
    const artifactId = (await getSafeArtifactId()).id;
    if (extension === '.md') {
      content = await replaceMarkdownMediaLinks(
        content,
        importInfo,
        artifactId,
      );
      content = await replaceMarkdownMediaTags(
        content,
        importInfo,
        artifactId,
      );
    }
    const title = path.parse(basename).name;

    const html = await marked.parse(content);
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
  return importInfo
}
