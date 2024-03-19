import { Prisma } from '@prisma/client';

export const artifactFieldsSummary = Prisma.validator<Prisma.ArtifactArgs>()({
  select: {
    id: true,
    title: true,
    userId: true,
    visibility: true,
    fields: {
      select: {
        text: true,
      },
    },
  },
});

export type ArtifactFieldsSummary = Prisma.ArtifactGetPayload<
  typeof artifactFieldsSummary
>;
