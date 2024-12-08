import { router as trpcRouter } from '../../trpc';
import { getImportJobs } from './getImportJobs';

export const aiRouter = trpcRouter({
  getImportJobs,
});
