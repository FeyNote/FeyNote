import { router as trpcRouter } from '../../trpc';
import { createImportJob } from './createImportJob';
import { getImportJobs } from './getImportJobs';
import { startImportJob } from './startImportJob';

export const importRouter = trpcRouter({
  createImportJob,
  startImportJob,
  getImportJobs,
});
