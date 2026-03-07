import { publicProcedure } from '../../trpc';
import { getSafeWorkspaceId as _getSafeWorkspaceId } from '@feynote/api-services';

export const getSafeWorkspaceId = publicProcedure.query(
  async (): Promise<{
    id: string;
  }> => {
    return _getSafeWorkspaceId();
  },
);
