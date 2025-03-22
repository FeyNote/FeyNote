import { Prisma, type JobType } from '@prisma/client';

export const jobSummary = Prisma.validator<Prisma.JobFindFirstArgs>()({
  select: {
    id: true,
    createdAt: true,
    status: true,
    type: true,
    meta: true,
  },
});

export enum ImportJobType {
  Obsidian = 'obsidian',
  Logseq = 'logseq',
}

export enum ExportJobType {
  Markdown = 'markdown',
  Json = 'json',
}

export interface JobMeta {
  exportType?: ExportJobType;
  s3Key?: string;
}

export type ImportJob = Omit<
  Prisma.JobGetPayload<typeof jobSummary>,
  'meta' | 'type'
> & {
  meta: {
    importType: ImportJobType;
    s3Key: string;
    title: string;
  };
  type: typeof JobType.Import;
};

export type ExportJob = Omit<
  Prisma.JobGetPayload<typeof jobSummary>,
  'meta' | 'type'
> & {
  meta: {
    exportType: ExportJobType;
    s3Key?: string;
  };
  type: typeof JobType.Export;
};

export type JobSummary = ImportJob | ExportJob;

export const prismaJobSummaryToJobSummary = (
  _jobSummary: Prisma.JobGetPayload<typeof jobSummary>,
) => {
  return _jobSummary as JobSummary;
};
