import { ImportJobType } from '@prisma/client';

export interface ImportJobQueueItem {
  triggeredByUserId: string;
  s3: string;
  type: ImportJobType;
}
