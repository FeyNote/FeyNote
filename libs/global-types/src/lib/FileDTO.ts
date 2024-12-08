import { FileSummary } from '@feynote/prisma/types';

export interface FileDTO {
  id: string;
  name: string;
  storageKey: string;
  mimetype: string;
}

// Check type inference between our static type and Prisma's dynamic type
const _ = {} as FileDTO satisfies FileSummary;
const __ = {} as FileSummary satisfies FileDTO;
