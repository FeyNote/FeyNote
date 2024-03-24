import { router as trpcRouter } from '../../trpc';
import { updateField } from './updateField';

export const router = trpcRouter({
  updateField,
});
