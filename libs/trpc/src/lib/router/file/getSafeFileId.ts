import { prisma } from '@feynote/prisma/client';
import { publicProcedure } from '../../trpc';

/**
 * A safeguard to prevent looping database calls.
 * We should never hit this, since the chance of a uuid colliding is extremely low
 */
const SAFETY_LIMIT = 15;

export const getSafeFileId = publicProcedure.query(
  async (): Promise<{
    id: string;
  }> => {
    let safetyLimit = 0;
    let candidateId = crypto.randomUUID();
    while (true) {
      if (safetyLimit >= SAFETY_LIMIT) {
        throw new Error('Exceeded number of attempts to find an ID');
      }

      const file = await prisma.file.findUnique({
        where: {
          id: candidateId,
        },
        select: {
          id: true,
        },
      });

      if (!file) {
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
