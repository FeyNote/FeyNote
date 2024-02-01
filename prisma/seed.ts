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

  const fieldTemplate1 = await prisma.fieldTemplate.create({
    data: {
      artifactTemplateId: artifactTemplateWorld.id,
      order: 2,
      type: 'Text',
      title: 'Description',
      aiPrompt: 'Generate me a description of a made-up high fantasy World',
      placeholder: 'Your world description',
      description:
        'A description of your world, such as defining landmass, landmarks, cultures, or races.',
      required: true,
    },
  });

  const fieldTemplate2 = await prisma.fieldTemplate.create({
    data: {
      artifactTemplateId: artifactTemplateWorld.id,
      order: 3,
      type: 'Text',
      title: 'History',
      aiPrompt: 'Generate me a history of a high fantasy World',
      placeholder: 'Your world history',
      description:
        'The history of your world, what led to the world being in its current state',
      required: true,
    },
  });

  const email = 'dnd-assistant';
  const user = await prisma.user.upsert({
    where: {
      email,
    },
    create: {
      email,
      passwordHash:
        'WLzJr1++FAsA0C6992QrCESxiBs5EqdCc/NEna4XgP4FuGiANN9gQ+Y+MRN4tqfk9IRxa89yxVwkGZvSfexk2vSvrGkjvxH/75wcuCpu/pieEZvNTTowyYcU/GG7HBmUSaN4NUjFVT3Y0XmxqQBEB746Q82hyH3WAUdt0MJMcovKNg0qbD6axR9V9VYESKJUq/wR68gUCIdbaEBh5mvZPWF1dtNi+PK5mxNNt4mbofQTqTqr+RYx2HUHQrzyl1lV2rf9o/RXBAUsqwEx1tvq4fAPLD0SvZLpNI4TvWljX5hTEUKXbdepYjRFu+FarLYOkKaoD3RGeIWT7Egit/3cZX2DqZiR3p8cLJNsFOH7iAA4+0TdFzYNfGuoGsP//oPdbuCV1AkSFxOnMD/Bt0jlGifhrg8fRGZ0wkrrJojqrmXS1/yfL23E2hQRl7tpEAzj/OFGJC7lIKHYEw7hCJAhmuoibmo/yNrW+VN//b+3UoYMjG4l/3/4DY5MmVpTpBhfw+7S9yUdJ3Bm6DaDqYGl7xQyQe0at/dizb0OG5lligS+n6zsszCjOmlq9uXV88jw95r2j69SzvZ1REbzH+wlIE9COeciBTkpCQqAqwMxdhPNuueiyuCdbzEQOKAJQjKfcln/4NzH5++CK+n/QLuHj/3HTv3FSHNCxmvPouJyDOM=',
      passwordSalt:
        'NCucuoY3fEoE/gTdKWbxpaYr+yj/2yjQvNUhXoFylZ2Y/sjdHnocs/WF6f6rGlGxCEEJElqxGyq4T4n9hWdG2zoj0E0hg4Mp+4HhJWykDeM5bJvGQAxb7JEzAnJGA6+8tvV1Cwl/Sl9IzAi11PyX2/FzxHzdm+IxpTA5BBv3gPA=',
      passwordVersion: 1,
    },
    update: {},
  });

  console.log({ user });

  await prisma.artifact.create({
    data: {
      title: 'Windemere',
      isPinned: true,
      visibility: 'Private',
      fields: {
        create: [
          {
            text: 'A world that exists beyond what you know',
            fieldTemplateId: fieldTemplate1.id,
          },
          {
            text: 'An incredible history to go with the world',
            fieldTemplateId: fieldTemplate2.id,
          },
        ],
      },
      artifactTemplateId: artifactTemplateWorld.id,
      userId: user.id,
    },
  });

  await prisma.artifact.create({
    data: {
      title: 'The Grove',
      isPinned: false,
      visibility: 'Public',
      fields: {
        create: [
          {
            text: 'A world that exists beyond what you know',
            fieldTemplateId: fieldTemplate1.id,
          },
          {
            text: 'An incredible history to go with the world',
            fieldTemplateId: fieldTemplate2.id,
          },
        ],
      },
      artifactTemplateId: artifactTemplateWorld.id,
      userId: user.id,
    },
  });
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
