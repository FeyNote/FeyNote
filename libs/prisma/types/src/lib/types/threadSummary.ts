import { Prisma } from '@prisma/client';

export const threadSummary = Prisma.validator<Prisma.ThreadArgs>()({
  select: {
    id: true,
    title: true,
    messages: {
      select: {
        id: true,
        json: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    },
  },
});

export type ThreadSummary = Prisma.ThreadGetPayload<typeof threadSummary>;
