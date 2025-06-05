import { router as trpcRouter } from '../../trpc';
import { getJobs } from './getJobs';
import { getJob } from './getJob';
import { startJob } from './startJob';
import { createImportJob } from './createImportJob';
import { createExportJob } from './createExportJob';

export const jobRouter = trpcRouter({
  createImportJob,
  createExportJob,
  startJob,
  getJobs,
  getJob,
});
