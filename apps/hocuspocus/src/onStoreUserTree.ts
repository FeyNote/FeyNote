import { encodeStateAsUpdate } from 'yjs';
import { onStoreDocumentPayload } from '@hocuspocus/server';
import { prisma } from '@feynote/prisma/client';
import { logger } from '@feynote/api-services';

export async function onStoreUserTree(
  args: onStoreDocumentPayload,
  identifier: string,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: identifier,
    },
    select: {
      treeYBin: true,
    },
  });

  if (!user) {
    logger.error('Attempting to save user tree that does not exist');
    throw new Error();
  }

  const treeYBin = Buffer.from(encodeStateAsUpdate(args.document));

  await prisma.user.update({
    where: {
      id: identifier,
    },
    data: {
      treeYBin,
    },
  });
}
