import { ImportJobSummary } from '@feynote/prisma/types';
import { ImportJobType, JobStatus } from '@prisma/client';

export interface ImportJobDTO {
  id: string;
  title: string;
  createdAt: Date;
  status: JobStatus;
  type: ImportJobType;
  file: {
    id: string;
    storageKey: string;
  };
}

// Check type inference between our static type and Prisma's dynamic type
const _ = {} as ImportJobDTO satisfies ImportJobSummary;
const __ = {} as ImportJobSummary satisfies ImportJobDTO;
