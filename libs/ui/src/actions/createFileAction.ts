import type { FilePurpose } from '@prisma/client';
import { trpc } from '../utils/trpc';
import { getSafeFileIdAction } from './getSafeFileIdAction';
import { uploadFileToApi } from '../utils/files/uploadFileToApi';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';

const MAX_OFFLINE_FILE_SIZE = 5 * 1024 * 1024;

export async function createFileAction(args: {
  file: File;
  artifactId?: string;
  purpose: FilePurpose;
  onProgress?: (progress: number) => void;
}) {
  const { id } = await getSafeFileIdAction();

  try {
    return await uploadFileToApi({ id, ...args });
  } catch (e) {
    if (args.file.size > MAX_OFFLINE_FILE_SIZE) {
      throw e;
    }

    const fileContentsUint8 = new Uint8Array(await args.file.arrayBuffer());

    args.onProgress?.(50);

    const manifestDb = await getManifestDb();
    await manifestDb.put(ObjectStoreName.PendingFiles, {
      id,
      fileName: args.file.name,
      mimetype: args.file.type,
      fileSize: args.file.size,
      purpose: args.purpose,
      artifactId: args.artifactId,
      fileContents: null,
      fileContentsUint8,
    });

    args.onProgress?.(100);

    return {
      id,
      name: args.file.name,
      mimetype: args.file.type,
      storageKey: 'UPLOADED_OFFLINE',
    } satisfies Awaited<ReturnType<typeof trpc.file.createFile.mutate>>;
  }
}
