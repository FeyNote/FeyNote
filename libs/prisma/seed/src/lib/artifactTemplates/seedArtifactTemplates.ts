import { Prisma, PrismaClient, User } from '@prisma/client';
import { artifactTemplateWorldData } from './artifactTemplateWorldData';
import { artifactTemplateRegionData } from './artifactTemplateRegionData';
import { artifactTemplateGenericLocationData } from './artifactTemplateGenericLocationData';
import { artifactTemplateCityTownData } from './artifactTemplateCityTownData';
import { artifactTemplateDungeonData } from './artifactTemplateDungeonData';
import { artifactTemplateDungeonRoomData } from './artifactTemplateDungeonRoomData';
import { artifactTemplateNPCData } from './artifactTemplateNPCData';
import { artifactTemplateShopTavernData } from './artifactTemplateShopTavernData';
import { artifactTemplatePlayerData } from './artifactTemplatePlayerData';
import { artifactTemplateQuestData } from './artifactTemplateQuestData';

const artifactTemplatesToCreate = [
  artifactTemplateWorldData,
  artifactTemplateRegionData,
  artifactTemplateGenericLocationData,
  artifactTemplateCityTownData,
  artifactTemplateDungeonData,
  artifactTemplateDungeonRoomData,
  artifactTemplateNPCData,
  artifactTemplateShopTavernData,
  artifactTemplatePlayerData,
  artifactTemplateQuestData,
];

export const seedArtifactTemplates = async (
  prisma: PrismaClient,
  user: User
) => {
  for (const artifactTemplateData of artifactTemplatesToCreate) {
    console.log(
      `Started Seeding Artifact Template of Type ${artifactTemplateData.data.title}`
    );
    const existingArtifactTemplates = await prisma.artifactTemplate.findMany({
      where: { userId: user.id, title: artifactTemplateData.data.title },
    });

    if (existingArtifactTemplates.length > 1) {
      throw new Error(
        `Two Artifact Templates of type ${
          artifactTemplateData.data.title
        } were found for RootUser: ${JSON.stringify(existingArtifactTemplates)}`
      );
    }

    let artifactTemplate = existingArtifactTemplates.at(0);

    if (artifactTemplate) {
      artifactTemplate = await prisma.artifactTemplate.upsert({
        where: {
          id: artifactTemplate.id,
        },
        create: artifactTemplateData.data,
        update: artifactTemplateData.data,
      });
    } else {
      artifactTemplate = await prisma.artifactTemplate.create({
        data: artifactTemplateData.data,
      });
    }

    for (const fieldTemplateData of artifactTemplateData.fields) {
      const fieldTemplateFullData = {
        ...fieldTemplateData,
        artifactTemplateId: artifactTemplate.id,
      } satisfies Prisma.FieldTemplateUncheckedCreateInput;
      await prisma.fieldTemplate.upsert({
        where: {
          order_artifactTemplateId: {
            order: fieldTemplateFullData.order,
            artifactTemplateId: artifactTemplate.id,
          },
        },
        create: fieldTemplateFullData,
        update: fieldTemplateFullData,
      });
    }

    console.log(
      `Finished Seeding Artifact Template of Type ${artifactTemplate.title}`
    );
  }
};
