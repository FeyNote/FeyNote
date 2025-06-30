import { publicProcedure } from '../../trpc';
import { getSafeArtifactId as _getSafeArtifactId } from '@feynote/api-services';

export const getSafeArtifactId = publicProcedure.query(
  async (): Promise<{
    id: string;
  }> => {
    return _getSafeArtifactId();
  },
);
