import { PrismaClient, User } from '@prisma/client';

export const seedArtifactTemplates = async (
  prisma: PrismaClient,
  user: User
) => {
  console.log(prisma, user);
};
