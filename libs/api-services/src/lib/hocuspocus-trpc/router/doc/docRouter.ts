import { router as trpcRouter } from '../../hocuspocusTrpc';
import { removeUserAccessToDoc } from './removeUserAccessToDoc';

export const docRouter = trpcRouter({
  removeUserAccessToDoc,
});
