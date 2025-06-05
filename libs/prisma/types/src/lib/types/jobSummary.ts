import { Prisma } from '@prisma/client';

export const jobSummary = Prisma.validator<Prisma.JobFindFirstArgs>()({
  select: {
    id: true,
    createdAt: true,
    status: true,
    type: true,
    meta: true,
  },
});

export enum JobErrorCode {
  UnknownError = 'unknown_error',
}

export enum ExportFormat {
  Markdown = 'markdown',
  Json = 'json',
}

export enum ImportFormat {
  Obsidian = 'obsidian',
  Logseq = 'logseq',
}

export type JobSummary = Omit<
  Prisma.JobGetPayload<typeof jobSummary>,
  'meta'
> & {
  meta: {
    importFormat?: ImportFormat;
    exportFormat?: ExportFormat;
    error?: JobErrorCode;
  };
};

export const prismaJobSummaryToJobSummary = (
  _jobSummary: Prisma.JobGetPayload<typeof jobSummary>,
) => {
  return _jobSummary as JobSummary;
};
