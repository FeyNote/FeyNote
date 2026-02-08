import { router as trpcRouter } from '../../trpc';
import { getJobs } from './getJobs';
import { createImportJob } from './createImportJob';
import { createExportJob } from './createExportJob';

export const jobRouter = trpcRouter({
  createImportJob,
  createExportJob,
  getJobs,
});
