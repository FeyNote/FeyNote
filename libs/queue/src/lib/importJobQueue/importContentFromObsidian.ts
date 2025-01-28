import {
  getCapabilitiesForUser,
  getSignedUrlForFilePurpose,
  uploadImageFromPathToS3,
} from '@feynote/api-services';
import { applyUpdate, encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import { generateJSON } from '@tiptap/html';
import {
  ArtifactTheme,
  ArtifactType,
  FilePurpose,
  Prisma,
} from '@prisma/client';
import { createWriteStream, readdirSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { extname, join, parse } from 'path';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import { starkdown } from 'starkdown';
import extract from 'extract-zip';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  constructYArtifact,
  getTextForJSONContent,
  getTiptapServerExtensions,
} from '@feynote/shared-utils';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '../artifactUpdateQueue/artifactUpdateQueue';
import { randomUUID } from 'crypto';
import { isImagePath } from './utils/isImagePath';
import { getPathWithoutExt } from './utils/getPathWithoutExt';
import { ReadableStream } from 'node:stream/web';

const pipelineAsync = promisify(pipeline);

const TTL_S3_PRESIGNED_URL = 3600; // 1 hour in sec
export const importContentFromObsidian = async (
  storageKey: string,
  userId: string,
) => {
  const purpose = FilePurpose.import;
  const s3SignedURL = await getSignedUrlForFilePurpose({
    key: storageKey,
    operation: 'getObject',
    purpose,
    expiresInSeconds: TTL_S3_PRESIGNED_URL,
  });

  const response = await fetch(s3SignedURL, {
    method: 'GET',
  });
  if (!response || !response.body) return;
  const tempDir = tmpdir(); // System temporary directory
  const zipDest = join(tempDir, `${Date.now()}-${Math.random()}.zip`);
  const fileStream = createWriteStream(zipDest);

  const nodeReadableStream = Readable.fromWeb(
    response.body as ReadableStream<Uint8Array>,
  );
  await pipelineAsync(nodeReadableStream, fileStream);
  const extractDest = join(tempDir, `${Date.now()}-${Math.random()}`);
  await extract(zipDest, { dir: extractDest });

  const filePaths = readdirSync(extractDest, { recursive: true }).map(
    (filePath) => join(extractDest, filePath.toString()),
  );

  const obsidianIdToDocInfoMap = new Map<
    string,
    {
      id: string;
      path: string;
    }
  >();
  filePaths.forEach((filePath) => {
    // References are kept in [[path]] or [[path|title]] format so must have a map to both
    const obsidianId = getPathWithoutExt(filePath);
    const title = parse(filePath).name;
    const documentInfo = { id: randomUUID(), path: filePath };
    obsidianIdToDocInfoMap.set(obsidianId, documentInfo);
    obsidianIdToDocInfoMap.set(`${obsidianId}|${title}`, documentInfo);
  });

  const artifactsToCreate: Array<Prisma.ArtifactCreateManyInput> = [];
  const imagesToCreate: {
    id: string;
    path: string;
  }[] = [];
  filePaths.forEach((filePath) => {
    if (extname(filePath) !== '.md') return;

    let markdown = readFileSync(filePath, 'utf-8');
    // Regex for matching artifact [[reference]] and ![[reference]] syntax
    const regex = /!?\[\[(.+?)\]\]/g;
    // Replace all references within artifact markdown
    for (const artifactMatch of markdown.matchAll(regex)) {
      let replacementHtml = '';
      const obsidianId = artifactMatch[1];
      if (obsidianIdToDocInfoMap.has(obsidianId)) {
        const documentInfo = obsidianIdToDocInfoMap.get(obsidianId);
        if (!documentInfo) continue;
        // Artifact reference
        if (extname(documentInfo.path) === '.md') {
          replacementHtml = `<span data-type="artifactReference" data-artifact-id="${documentInfo.id}" data-artifact-reference-text="${parse(documentInfo.path).name}"></span>`;
        } else if (isImagePath(documentInfo.path)) {
          replacementHtml = `<img fileId="${documentInfo.id}" />`;
          // Ensure image is not already enqueued for creation
          if (!imagesToCreate.some((image) => image.id === documentInfo.id)) {
            imagesToCreate.push({
              id: documentInfo.id,
              path: documentInfo.path,
            });
          }
        }
      }
      markdown = markdown.replace(artifactMatch[0], replacementHtml);
    }

    const html = starkdown(markdown);
    const extensions = getTiptapServerExtensions();
    const tiptap = generateJSON(html, extensions);
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
    const obsidianId = getPathWithoutExt(filePath);
    const docInfo = obsidianIdToDocInfoMap.get(obsidianId);
    if (!docInfo) return;
    artifactsToCreate.push({
      id: docInfo.id,
      userId,
      title,
      type: ArtifactType.tiptap,
      text,
      json: tiptap,
      yBin,
    });
  });

  const userCapabilities = await getCapabilitiesForUser(userId);
  const files = [];
  for (const imageInfo of imagesToCreate) {
    const { mimetype, purpose, uploadResult } = await uploadImageFromPathToS3(
      imageInfo.path,
      userCapabilities,
    );

    const fileData = {
      id: imageInfo.id,
      userId: userId,
      name: parse(imageInfo.path).name,
      mimetype: mimetype,
      storageKey: uploadResult.key,
      purpose: purpose,
      metadata: {
        uploadResult,
      },
    };
    files.push(fileData);
  }

  await prisma.file.createManyAndReturn({
    data: files,
  });
  const createdArtifacts = await prisma.artifact.createManyAndReturn({
    data: files,
    select: {
      id: true,
      yBin: true,
    },
  });

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
  unlinkSync(zipDest);
};
