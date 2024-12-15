import { router as trpcRouter } from '../../trpc';
import { createImportJob } from './createImportJob';

export const importRouter = trpcRouter({
  createImportJob,
});
