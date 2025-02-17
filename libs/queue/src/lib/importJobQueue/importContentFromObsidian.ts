import {
  convertImageForStorage,
  uploadFileToS3,
} from '@feynote/api-services';
import { applyUpdate, encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import { generateJSON } from '@tiptap/html';
import {
  ArtifactTheme,
  ArtifactType,
  FilePurpose,
  Prisma,
} from '@prisma/client';
import { readFile, rm } from 'fs/promises';
import path, { basename, extname, parse } from 'path';
import { marked } from 'marked';
import {
    addMissingBlockIds,
  ARTIFACT_TIPTAP_BODY_KEY,
  constructYArtifact,
  getTextForJSONContent,
  getTiptapServerExtensions,
} from '@feynote/shared-utils';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '../artifactUpdateQueue/artifactUpdateQueue';
import { randomUUID } from 'crypto';
import { getObsidianReferenceId } from './utils/getObsidianReferenceId';
import { replaceObsidianReferences } from './utils/replaceObsidianReferences';
import { replaceObsidianHeadings } from './utils/replaceObsidianHeadings';
import { downloadZipFromS3 } from './utils/downloadZipFromS3';
import { replaceImageFileTags } from './utils/replaceImageFileTags';
import { replaceImageHttpTags } from './utils/replaceImageHttpTags';
import { pushImgTagsToNewLine } from './utils/pushImgTagsToNewLine';

export const importContentFromObsidian = async (
  storageKey: string,
  userId: string,
) => {
  const { filePaths, zipDest, extractDest } = await downloadZipFromS3(storageKey);
  if (!filePaths) return;

  // Find the path to base level of obsidian valut (what folders need to be navigated to reach the .obsidian folder)
  const obsidianConfigDirPath = filePaths.find((filePath) => filePath.includes('.obsidian'));
  if (!obsidianConfigDirPath) throw Error('No .obsidian folder found in the zip file');
  const pathToRelativeReferences = path.join(...obsidianConfigDirPath.split(path.sep).slice(0, -1))

  const referenceIdToInfoMap = new Map<
    string,
    {
      id: string;
      path: string;
    }
  >();
  filePaths.forEach((filePath) => {
    const obsidianReferenceId = getObsidianReferenceId(filePath, pathToRelativeReferences);
    const id = randomUUID();
    referenceIdToInfoMap.set(obsidianReferenceId, { id, path: filePath });
  })

  const artifactsToCreate = Array<Prisma.ArtifactCreateManyInput>();
  const imageFilesUploaded = Array<Prisma.FileCreateManyInput>();
  const imageFilesToUpload: {
    id: string;
    associatedArtifactId: string;
    path: string
  }[] = []

  const fileUploadCountRef = {
    fileUploadCount: 0,
  };
  for await (const filePath of filePaths) {
    console.log(`\nFile Path:\n${filePath}\n`);
    if (extname(filePath) !== '.md') continue;
    const obsidianReferenceId = getObsidianReferenceId(filePath, pathToRelativeReferences);
    const artifactId = referenceIdToInfoMap.get(obsidianReferenceId)?.id ?? randomUUID();

    let markdown = await readFile(filePath, 'utf-8');
    console.log(`\n\n\nFile Read:\n${markdown}\n\n\n`);
    markdown = pushImgTagsToNewLine(markdown)
    markdown = replaceObsidianReferences(markdown, referenceIdToInfoMap, imageFilesToUpload, artifactId);
    markdown = replaceObsidianHeadings(markdown);
    markdown = replaceImageFileTags(markdown, referenceIdToInfoMap, imageFilesToUpload, artifactId);
    const replacementResult = await replaceImageHttpTags(markdown, userId, fileUploadCountRef, artifactId);
    imageFilesUploaded.push(...replacementResult.files);
    markdown = replacementResult.updatedContent;

    // console.log(`\n\n\nMarkdown:\n${markdown}\n\n\n`);
    const html = await marked.parse(markdown);
    const extensions = getTiptapServerExtensions();
    const tiptap = generateJSON(html, extensions);
    addMissingBlockIds(tiptap);
    console.log(`\n\n\nTipTap:\n${JSON.stringify(tiptap, null, 2)}\n\n\n`);

    const text = getTextForJSONContent(tiptap);
    const title = parse(filePath).name;
    const yDoc = constructYArtifact({
      title,
      theme: ArtifactTheme.default,
      type: ArtifactType.tiptap,
      titleBodyMerge: true,
    });
    const tiptapYContent = TiptapTransformer.toYdoc(
      tiptap,
      ARTIFACT_TIPTAP_BODY_KEY,
      extensions,
    );
    applyUpdate(yDoc, encodeStateAsUpdate(tiptapYContent));
    const yBin = Buffer.from(encodeStateAsUpdate(yDoc));

    artifactsToCreate.push({
      id: artifactId,
      userId,
      title,
      type: ArtifactType.tiptap,
      text,
      json: tiptap,
      yBin,
    });
  }

  for await (const imageInfo of imageFilesToUpload) {
    const buffer = await convertImageForStorage(userId, imageInfo.path);

    const purpose = FilePurpose.artifact;
    const mimetype = 'image/jpeg';
    const name = basename(imageInfo.path, extname(imageInfo.path));
    const uploadResult = await uploadFileToS3(buffer, mimetype, purpose);

    const fileData = {
      id: imageInfo.id,
      artifactId: imageInfo.associatedArtifactId,
      userId,
      name,
      mimetype,
      storageKey: uploadResult.key,
      purpose,
      metadata: {
        uploadResult,
      },
    };
    imageFilesUploaded.push(fileData)
  }
  const { createdArtifacts } = await prisma.$transaction(async (tx) => {
    const createdArtifacts = await tx.artifact.createManyAndReturn({
      data: artifactsToCreate,
      select: {
        id: true,
        yBin: true,
      },
    })
    await tx.file.createManyAndReturn({
      data: imageFilesUploaded,
      select: {
        id: true
      }
    })

    return { createdArtifacts }
  })

  for (const artifact of createdArtifacts) {
    await enqueueArtifactUpdate({
      artifactId: artifact.id,
      userId,
      triggeredByUserId: userId,
      oldReadableUserIds: [],
      newReadableUserIds: [userId],
      oldYBinB64: Buffer.from(encodeStateAsUpdate(new YDoc())).toString(
        'base64',
      ),
      newYBinB64: Buffer.from(artifact.yBin).toString('base64'),
    });
  }
  await rm(zipDest, { recursive: true });
  await rm(extractDest, { recursive: true });
};
