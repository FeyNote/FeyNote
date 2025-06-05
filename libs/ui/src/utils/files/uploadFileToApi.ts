import type { FilePurpose } from '@prisma/client';
import { trpc } from '../trpc';
import { encodeFileStream } from '@feynote/shared-utils';
import { getApiUrls } from '../getApiUrls';
import axios from 'axios';
import { appIdbStorageManager } from '../AppIdbStorageManager';
import type { FileDTO } from '@feynote/global-types';

export const uploadFileToApi = async (args: {
  file: File;
  artifactId?: string;
  purpose: FilePurpose;
  onProgress?: (progress: number | undefined) => void;
}) => {
  const { id } = await trpc.file.getSafeFileId.query();

  const payload = await encodeFileStream({
    id,
    file: args.file,
    artifactId: args.artifactId,
    purpose: args.purpose,
  });

  const url = getApiUrls().trpc + '/file/file.createFile'
  const session = await appIdbStorageManager.getSession();
  const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/octet-stream',
        Authorization: session?.token ? `Bearer ${session.token}` : undefined,
      },
      onUploadProgress: (progressEvent) => {
        args.onProgress?.(progressEvent.progress);
      },
  })

  console.log(response.data.result.data);

  return response.data.result.data as FileDTO
};
