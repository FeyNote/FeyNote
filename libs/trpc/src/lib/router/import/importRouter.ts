import { router as trpcRouter } from '../../trpc';
import { createImportJob } from './createImportJob';
import { getImportJobs } from './getImportJobs';

export const importRouter = trpcRouter({
  createImportJob,
  getImportJobs,
});
