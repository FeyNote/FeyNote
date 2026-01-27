import { JobStatus, JobType, Prisma } from '@prisma/client';
import z from 'zod';

export const jobSummary = Prisma.validator<Prisma.JobFindFirstArgs>()({
  select: {
    id: true,
    userId: true,
    createdAt: true,
    status: true,
    type: true,
    meta: true,
    progress: true,
  },
});

export const zExportFormat = z.enum(['markdown', 'json']);
export type ExportFormat = z.infer<typeof zExportFormat>;

export const zImportFormat = z.enum([
  'obsidian',
  'logseq',
  'text',
  'markdown',
  'docx',
  'gDrive',
]);
export type ImportFormat = z.infer<typeof zImportFormat>;

export enum JobErrorCode {
  UnknownError = 'unknown_error',
}

const jobSummarySchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  status: z.nativeEnum(JobStatus),
  type: z.nativeEnum(JobType),
  progress: z.number(),
  meta: z.object({
    importFormat: zImportFormat.optional(),
    exportFormat: zExportFormat.optional(),
    error: z.nativeEnum(JobErrorCode).optional(),
  }),
});

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

const _ = {} as JobSummary satisfies z.infer<typeof jobSummarySchema>;
const __ = {} as z.infer<typeof jobSummarySchema> satisfies JobSummary;

export const prismaJobSummaryToJobSummary = (
  job: PrismaJobSummary,
): JobSummary => {
  const jobSummary = jobSummarySchema.parse(job);
  return jobSummary as JobSummary;
};

export type PrismaJobSummary = Prisma.JobGetPayload<typeof jobSummary>;
