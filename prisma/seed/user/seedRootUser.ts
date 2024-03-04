import { PrismaClient } from '@prisma/client';

const ROOT_USER_EMAIL = 'tabletop-assistant@tabletop-assistant.io';

export const seedRootUser = async (prisma: PrismaClient) => {
  const rootUser = await prisma.user.upsert({
    where: {
      email: ROOT_USER_EMAIL,
    },
    create: {
      email: ROOT_USER_EMAIL,
    },
    update: {},
  });
  return rootUser;
};
