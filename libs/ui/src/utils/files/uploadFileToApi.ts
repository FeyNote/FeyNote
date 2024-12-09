import type { FilePurpose } from '@prisma/client';
import { getApiUrls } from '../getApiUrls';
import { FileDTO } from '@feynote/global-types';

export const uploadFileToApi = async (args: {
  file: File;
  artifactId?: string;
  purpose: FilePurpose;
  sessionToken: string;
}) => {
  const url = new URL(`${getApiUrls().rest}/file`, window.location.origin);
  url.searchParams.append('purpose', 'artifact');
  if (args.artifactId) url.searchParams.append('artifactId', args.artifactId);
  url.searchParams.append('name', args.file.name);
  url.searchParams.append('mimetype', args.file.type);

  const body = new FormData();
  body.append('file', args.file);

  const response = await fetch(url, {
    method: 'POST',
    body: body,
    headers: {
      Authorization: `Bearer ${args.sessionToken}`,
    },
  });
  const fileDTO = (await response.json()) as FileDTO;

  return fileDTO;
};
