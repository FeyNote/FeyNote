import { publicProcedure } from '../../trpc';
import { getSafeFileId as _getSafeFileId } from '@feynote/api-services';

export const getSafeFileId = publicProcedure.query(
  async (): Promise<{
    id: string;
  }> => {
    return _getSafeFileId();
  },
);
