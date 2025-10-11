import type { JobSummary } from "@feynote/prisma/types";
import type { JobProgressTracker } from "../JobProgressTracker";
import type { StandardizedImportInfo } from "./StandardizedImportInfo";
import { readFile } from "fs/promises";
import path from 'path';
import { convertFile, FileFormat, getSafeArtifactId } from "@feynote/api-services";
import { addMissingBlockIds, ARTIFACT_TIPTAP_BODY_KEY, constructYArtifact, getTextForJSONContent, getTiptapServerExtensions } from "@feynote/shared-utils";
import { generateJSON } from "@tiptap/core";
import { ArtifactAccessLevel, ArtifactTheme, ArtifactType } from "@prisma/client";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { applyUpdate, encodeStateAsUpdate } from "yjs";
import * as Sentry from '@sentry/node';

export const docxToStandardizedImport = async (args: {
  job: JobSummary;
  filePaths: string[];
  progressTracker: JobProgressTracker;
}): Promise<StandardizedImportInfo> => {
  const importInfo: StandardizedImportInfo = {
    artifactsToCreate: [],
    mediaFilesToUpload: [],
  };

  const convertedFilePaths: string[] = []

  for await (const filePath of args.filePaths) {
    if (path.extname(filePath) !== '.docx') continue

    const convertedFilePath = await convertFile({
      inputFilePath: filePath,
      inputFormat: FileFormat.Docx,
      outputFormat: FileFormat.Html,
    }).catch((e) => {
      Sentry.captureException(e, {
        extra: {
          userId: args.job.userId,
          jobId: args.job.id,
          fileBaseName: path.basename(e.filePath)
        },
      });
      throw new Error(e)
    })

    convertedFilePaths.push(convertedFilePath)
  }

  for (let i = 0; i < convertedFilePaths.length; i++) {
    const filePath = args.filePaths[i];
    const basename = path.basename(filePath);
    const html = JSON.parse(await readFile(filePath, 'utf-8'));
    const artifactId = (await getSafeArtifactId()).id;
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
  return importInfo
}
