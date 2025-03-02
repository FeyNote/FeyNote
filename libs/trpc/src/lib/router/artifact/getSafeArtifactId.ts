import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { publicProcedure } from '../../trpc';

/**
 * A safeguard to prevent looping database calls.
 * We should never hit this, since the chance of a uuid colliding is extremely low
 */
const SAFETY_LIMIT = 15;

export const getSafeArtifactId = publicProcedure.query(
  async (): Promise<{
    id: string;
  }> => {
    let safetyLimit = 0;
    let candidateId = crypto.randomUUID();
    while (true) {
      if (safetyLimit >= SAFETY_LIMIT) {
        throw new Error('Exceeded number of attempts to find an ID');
      }

      const artifact = await prisma.artifact.findUnique({
        where: {
          id: candidateId,
        },
        ...artifactDetail,
      });

      if (!artifact) {
        break;
      }

      candidateId = crypto.randomUUID();
      safetyLimit++;
    }

    return {
      id: candidateId,
    };
  },
);
