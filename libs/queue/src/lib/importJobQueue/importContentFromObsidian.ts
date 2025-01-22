import { getSignedUrlForFilePurpose } from '@feynote/api-services';
import { applyUpdate, encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import { generateJSON } from '@tiptap/html';
import { ArtifactTheme, ArtifactType, FilePurpose } from '@prisma/client';
import { createWriteStream, readdirSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { extname, join, parse } from 'path';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import { starkdown } from 'starkdown';
import extract from 'extract-zip';
import { ARTIFACT_TIPTAP_BODY_KEY, constructYArtifact, getTextForJSONContent, getTiptapServerExtensions } from '@feynote/shared-utils';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '../artifactUpdateQueue/artifactUpdateQueue';
import { randomUUID } from 'crypto';

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
  if (!response || !response.body) return
  const tempDir = tmpdir(); // System temporary directory
  const zipDest = join(tempDir, `${Date.now()}-${Math.random()}.zip`);
  const fileStream = createWriteStream(zipDest);

  const nodeReadableStream = Readable.fromWeb(response.body as any); // TODO fix casting
  await pipelineAsync(nodeReadableStream, fileStream);
  const extractDest = join(tempDir, `${Date.now()}-${Math.random()}`);
  await extract(zipDest, { dir: extractDest })

  const filePaths = readdirSync(extractDest, { recursive: true }).map((filePath) => join(extractDest, filePath.toString()));
  const artifactAttachments = new Set(filePaths.filter((filePath) => extname(filePath) !== '.md').map((filePath) => parse(filePath).base))
  const newArtifacts: any[] = []
  const artifactTitleToIdMap = new Map<string, string>();
  filePaths.forEach((filePath) => {
    const fileExtension = extname(filePath);
    if (fileExtension !== '.md') return;

    const title = parse(filePath).name
    console.log(`processing file;`, title)
    if (!artifactTitleToIdMap.has(title)) {
      artifactTitleToIdMap.set(title, randomUUID());
    }
    let markdown = readFileSync(filePath, 'utf-8');
    console.log(`markdown: ${markdown}`)
    const regex = /!?\[\[(.+?)\]\]/g
    for (const artifactMatch of markdown.matchAll(regex)) {
      let replacementHtml = '';
      if (artifactAttachments.has(artifactMatch[1])) {
        replacementHtml = `<img fileId="placeholder" />`
      } else {
        let artifactId = artifactTitleToIdMap.get(artifactMatch[1]);
        if (!artifactId) {
          artifactId = randomUUID();
          artifactTitleToIdMap.set(artifactMatch[1], artifactId);
        }
        replacementHtml = `<span data-type="artifactReference" data-artifact-id="${artifactId}" data-artifact-reference-text="${title}"></span>`
      }
      console.log(`replacementHtml: ${replacementHtml}`)
      console.log(`artifactMatch: ${artifactMatch[0]}`)
      markdown = markdown.replace(artifactMatch[0], replacementHtml)
    }
    console.log(`markdown after conversion: ${markdown}`)
    const html = starkdown(markdown);
    console.log(`html: ${html}`)
    const extensions = getTiptapServerExtensions();
    const tiptap = generateJSON(html, extensions);
    const text = getTextForJSONContent(tiptap);
    const yDoc = constructYArtifact({
      title,
      theme: ArtifactTheme.default,
      type: ArtifactType.tiptap,
      titleBodyMerge: true,
    })
    const tiptapYContent = TiptapTransformer.toYdoc(
      tiptap,
      ARTIFACT_TIPTAP_BODY_KEY,
      extensions,
    );
    applyUpdate(yDoc, encodeStateAsUpdate(tiptapYContent));
    const yBin = Buffer.from(encodeStateAsUpdate(yDoc));
    newArtifacts.push({
      id: artifactTitleToIdMap.get(title),
      userId,
      title,
      type: ArtifactType.tiptap,
      text,
      json: tiptap,
      yBin,
    });
  })
  const createdArtifacts = await prisma.artifact.createManyAndReturn({
    data: newArtifacts,
    select: {
      id: true,
      yBin: true,
    }
  });
  for (const artifact of createdArtifacts) {
    await enqueueArtifactUpdate({
      artifactId: artifact.id,
      userId,
      triggeredByUserId: userId,
      oldReadableUserIds: [],
      newReadableUserIds: [userId],
      oldYBinB64: Buffer.from(encodeStateAsUpdate(new YDoc())).toString('base64'),
      newYBinB64: Buffer.from(artifact.yBin).toString('base64'),
    })
  }
  unlinkSync(zipDest)
};
