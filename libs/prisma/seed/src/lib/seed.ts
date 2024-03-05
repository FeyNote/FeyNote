import { seedRootUser } from './user/seedRootUser';
import { seedArtifactTemplates } from './artifactTemplates/seedArtifactTemplates';
import { prisma } from '@dnd-assistant/prisma/client';

async function seed() {
  const rootUser = await seedRootUser(prisma);
  await seedArtifactTemplates(prisma, rootUser);
}

seed();
