import { Prisma } from '@prisma/client';

export const importJobSummary =
  Prisma.validator<Prisma.ImportJobFindFirstArgs>()({
    select: {
      id: true,
      title: true,
      createdAt: true,
      status: true,
      type: true,
      file: {
        select: {
          id: true,
          storageKey: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

export type ImportJobSummary = Prisma.ImportJobGetPayload<
  typeof importJobSummary
>;
