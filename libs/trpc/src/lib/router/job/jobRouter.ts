import { router as trpcRouter } from '../../trpc';
import { createImportJob } from './createImportJob';
import { createExportJob } from './createExportJob';
import { getImportExportJobs } from './getImportExportJobs';
import { startJob } from './startJob';

export const jobRouter = trpcRouter({
  createImportJob,
  createExportJob,
  startJob,
  getImportExportJobs,
});
