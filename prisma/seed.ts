import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const artifactTemplateWorld = await prisma.artifactTemplate.create({
    data: {
      title: 'World',
      visibility: 'Public',
      fieldTemplates: {
        create: [
          {
            order: 1,
            type: 'Text',
            title: 'Name',
            aiPrompt: 'Give me a name for a high fantasy World',
            placeholder: 'Your world name',
            description: 'A name for your world, such as "Middle Earth".',
            required: true,
          },
          {
            order: 2,
            type: 'Text',
            title: 'Description',
            aiPrompt:
              'Generate me a description of a made-up high fantasy World',
            placeholder: 'Your world description',
            description:
              'A description of your world, such as defining landmass, landmarks, cultures, or races.',
            required: true,
          },
          {
            order: 3,
            type: 'Text',
            title: 'History',
            aiPrompt: 'Generate me a history of a high fantasy World',
            placeholder: 'Your world history',
            description:
              'The history of your world, what led to the world being in its current state',
            required: true,
          },
        ],
      },
    },
  });

  console.log({ artifactTemplateWorld });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
