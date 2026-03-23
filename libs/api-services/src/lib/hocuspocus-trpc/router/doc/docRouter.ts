import { router as trpcRouter } from '../../hocuspocusTrpc';
import { addArtifactsToWorkspace } from './addArtifactsToWorkspace';
import { removeUserAccessToDoc } from './removeUserAccessToDoc';

export const docRouter = trpcRouter({
  addArtifactsToWorkspace,
  removeUserAccessToDoc,
});
