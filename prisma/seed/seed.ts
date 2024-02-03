import { PrismaClient } from '@prisma/client';
import { seedRootUser } from './user/seedRootUser';
import { seedArtifactTemplates } from './artifactTemplates/seedArtifactTemplates';

const prisma = new PrismaClient();

async function main() {
  const rootUser = await seedRootUser(prisma);
  await seedArtifactTemplates(prisma, rootUser);
}

main();
