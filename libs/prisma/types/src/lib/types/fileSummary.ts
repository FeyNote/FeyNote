import { Prisma } from '@prisma/client';

export const fileSummary = Prisma.validator<Prisma.FileArgs>()({
  select: {
    id: true,
    name: true,
    storageKey: true,
    mimetype: true,
  },
});

export type FileSummary = Prisma.FileGetPayload<typeof fileSummary>;
