import { Prisma } from '@prisma/client';

export const threadSummary = Prisma.validator<Prisma.ThreadArgs>()({
  select: {
    id: true,
    title: true,
    messages: {
      select: {
        id: true,
        json: true,
      },
    },
  },
});

export type ThreadSummary = Prisma.ThreadGetPayload<typeof threadSummary>;
