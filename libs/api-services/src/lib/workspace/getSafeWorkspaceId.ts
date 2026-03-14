import { prisma } from '@feynote/prisma/client';

const SAFETY_LIMIT = 15;

export const getSafeWorkspaceId = async (): Promise<{ id: string }> => {
  let safetyLimit = 0;
  let candidateId = crypto.randomUUID();
  while (true) {
    if (safetyLimit >= SAFETY_LIMIT) {
      throw new Error('Exceeded number of attempts to find an ID');
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: candidateId,
      },
      select: {
        id: true,
      },
    });

    if (!workspace) {
      break;
    }

    candidateId = crypto.randomUUID();
    safetyLimit++;
  }

  return {
    id: candidateId,
  };
};
