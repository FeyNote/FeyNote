import { prisma } from '@dnd-assistant/prisma/client';
import { seedRootUser } from './user/seedRootUser';
import { seedArtifactTemplates } from './artifactTemplates/seedArtifactTemplates';
import { searchProvider } from '@dnd-assistant/search';
import { FieldType } from '@prisma/client';

async function main() {
  console.log('Started development seeding');
  const rootUser = await seedRootUser(prisma);
  await seedArtifactTemplates(prisma, rootUser);
  const artifactTemplate = await prisma.artifactTemplate.findFirst({});
  if (!artifactTemplate)
    throw new Error('Must run seed.ts must be ran prior to this file');

  console.log({ artifactTemplateWorld: artifactTemplate });

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

  const fieldTemplates = await prisma.artifactFieldTemplate.findMany({
    where: {
      artifactTemplateId: artifactTemplate.id,
    },
  });

  const fields = fieldTemplates.map((fieldTemplate, indx) => {
    return {
      text: 'blah',
      title: 'Title',
      order: indx,
      type: FieldType.Text,
      fieldTemplateId: fieldTemplate.id,
    };
  });

  const artifact1 = await prisma.artifact.create({
    data: {
      title: 'Windemere',
      isPinned: true,
      visibility: 'Private',
      artifactFields: {
        create: fields,
      },
      artifactTemplateId: artifactTemplate.id,
      userId: user.id,
    },
  });

  const artifact2 = await prisma.artifact.create({
    data: {
      title: 'The Grove',
      isPinned: false,
      visibility: 'Public',
      artifactFields: {
        create: fields,
      },
      artifactTemplateId: artifactTemplate.id,
      userId: user.id,
    },
  });

  await searchProvider.indexArtifacts([artifact1.id, artifact2.id]);
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
