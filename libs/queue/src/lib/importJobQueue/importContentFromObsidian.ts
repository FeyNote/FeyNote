import {
  getCapabilitiesForUser,
  uploadImageFromPathToS3,
} from '@feynote/api-services';
import { applyUpdate, encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import { generateJSON } from '@tiptap/html';
import {
  ArtifactTheme,
  ArtifactType,
  Prisma,
} from '@prisma/client';
import { readFileSync, rmSync } from 'fs';
import path, { extname, parse } from 'path';
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

  const artifactsToCreate: Array<Prisma.ArtifactCreateManyInput> = [];
  const imagesToCreate: {
    id: string;
    path: string;
  }[] = [];

  const imagePathToIdMap = new Map<string, string>();
  const fileUploadCountRef = {
    fileUploadCount: 0,
  };
  console.log(`\nFile Paths:\n${filePaths}\n`);
  for await (const filePath of filePaths) {
    console.log(`\nFile Path:\n${filePath}\n`);
    if (extname(filePath) !== '.md') continue;

    let markdown = readFileSync(filePath, 'utf-8');
    console.log(`\n\n\nFile Read:\n${markdown}\n\n\n`);
    markdown = replaceObsidianReferences(markdown, referenceIdToInfoMap, imagesToCreate);
    markdown = replaceObsidianHeadings(markdown);
    markdown = replaceImageFileTags(markdown, imagePathToIdMap);
    const replacementResult = await replaceImageHttpTags(markdown, userId, fileUploadCountRef);
    markdown = replacementResult.updatedContent;

    const html = marked.parse(markdown, { async: false });
    console.log(`\n\n\nHTML:\n${html}\n\n\n`);
    //const extensions = getTiptapServerExtensions();
    //const tiptap = generateJSON(html, extensions);
    //addMissingBlockIds(tiptap);
    //
    //const text = getTextForJSONContent(tiptap);
    //const title = parse(filePath).name;
    //const yDoc = constructYArtifact({
    //  title,
    //  theme: ArtifactTheme.default,
    //  type: ArtifactType.tiptap,
    //  titleBodyMerge: true,
    //});
    //const tiptapYContent = TiptapTransformer.toYdoc(
    //  tiptap,
    //  ARTIFACT_TIPTAP_BODY_KEY,
    //  extensions,
    //);
    //applyUpdate(yDoc, encodeStateAsUpdate(tiptapYContent));
    //const yBin = Buffer.from(encodeStateAsUpdate(yDoc));
    //
    //const obsidianReferenceId = getObsidianReferenceId(filePath, pathToRelativeReferences);
    //const docInfo = referenceIdToInfoMap.get(obsidianReferenceId);
  //  artifactsToCreate.push({
  //    id: docInfo?.id ?? randomUUID(),
  //    userId,
  //    title,
  //    type: ArtifactType.tiptap,
  //    text,
  //    json: tiptap,
  //    yBin,
  //  });
  //});
  //
  //const userCapabilities = await getCapabilitiesForUser(userId);
  //const files = [];
  //for (const imageInfo of imagesToCreate) {
  //  const { mimetype, purpose, uploadResult } = await uploadImageFromPathToS3(
  //    imageInfo.path,
  //    userCapabilities,
  //  );
  //
  //  const fileData = {
  //    id: imageInfo.id,
  //    userId: userId,
  //    name: parse(imageInfo.path).name,
  //    mimetype: mimetype,
  //    storageKey: uploadResult.key,
  //    purpose: purpose,
  //    metadata: {
  //      uploadResult,
  //    },
  //  };
  //  files.push(fileData);
  //}
  //const [_, createdArtifacts] = await prisma.$transaction([
  //  prisma.file.createManyAndReturn({
  //    data: files,
  //    select: {
  //      id: true
  //    }
  //  }),
  //  prisma.artifact.createManyAndReturn({
  //    data: artifactsToCreate,
  //    select: {
  //      id: true,
  //      yBin: true,
  //    },
  //  })
  //])
  //
  //for (const artifact of createdArtifacts) {
  //  await enqueueArtifactUpdate({
  //    artifactId: artifact.id,
  //    userId,
  //    triggeredByUserId: userId,
  //    oldReadableUserIds: [],
  //    newReadableUserIds: [userId],
  //    oldYBinB64: Buffer.from(encodeStateAsUpdate(new YDoc())).toString(
  //      'base64',
  //    ),
  //    newYBinB64: Buffer.from(artifact.yBin).toString('base64'),
  //  });
  //}
  //rmSync(zipDest, { recursive: true });
  //rmSync(extractDest, { recursive: true });
};
