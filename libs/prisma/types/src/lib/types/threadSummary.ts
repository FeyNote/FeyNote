import { Prisma } from '@prisma/client';

export const threadSummary = Prisma.validator<Prisma.ThreadFindFirstArgs>()({
  select: {
    id: true,
    title: true,
    messages: {
      select: {
        id: true,
        vercelJsonV5: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    },
  },
});

export type ThreadSummary = Prisma.ThreadGetPayload<typeof threadSummary>;
