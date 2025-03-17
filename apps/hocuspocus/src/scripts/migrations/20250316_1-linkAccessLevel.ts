import { prisma } from '@feynote/prisma/client';
import '../../instrument.ts';
import { hocuspocusServer } from '../../server';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10');

(async () => {
  const ids = await prisma.artifact.findMany({
    select: {
      id: true,
    },
  });

  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    batches.push(ids.slice(i, i + BATCH_SIZE).map((b) => b.id));
  }

  for (const batch of batches) {
    const artifacts = await prisma.artifact.findMany({
      where: {
        id: {
          in: batch,
        },
      },
      select: {
        id: true,
        linkAccessLevel: true,
      },
    });

    for (const { id, linkAccessLevel } of artifacts) {
      const connection = await hocuspocusServer.openDirectConnection(
        `artifact:${id}`,
        {},
      );

      await connection.transact((yDoc) => {
        const yMap = yDoc.getMap(ARTIFACT_META_KEY);
        yMap.set('linkAccessLevel', linkAccessLevel);
      });

      await connection.disconnect();
    }
  }

  process.exit(0);
})();
