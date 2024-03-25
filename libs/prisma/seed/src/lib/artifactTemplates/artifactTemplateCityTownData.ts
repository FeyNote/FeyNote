import { ArtifactTemplateData } from '../types';
import { FieldType } from '@prisma/client';

let order = 1;

export const artifactTemplateCityTownData = {
  data: {
    title: 'artifactTemplate.cityTown.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: FieldType.Text,
      title: 'artifactTemplate.cityTown.name.title',
      aiPrompt: 'artifactTemplate.cityTown.name.aiPrompt',
      placeholder: 'artifactTemplate.cityTown.name.placeholder',
      description: 'artifactTemplate.cityTown.name.description',
      required: true,
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.cityTown.description.title',
      aiPrompt: 'artifactTemplate.cityTown.description.aiPrompt',
      placeholder: 'artifactTemplate.cityTown.description.placeholder',
      description: 'artifactTemplate.cityTown.description.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.cityTown.locations.title',
      aiPrompt: 'artifactTemplate.cityTown.locations.aiPrompt',
      placeholder: 'artifactTemplate.cityTown.locations.placeholder',
      description: 'artifactTemplate.cityTown.locations.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.cityTown.notableNPCs.title',
      aiPrompt: 'artifactTemplate.cityTown.notableNPCs.aiPrompt',
      placeholder: 'artifactTemplate.cityTown.notableNPCs.placeholder',
      description: 'artifactTemplate.cityTown.notableNPCs.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.cityTown.politics.title',
      aiPrompt: 'artifactTemplate.cityTown.politics.aiPrompt',
      placeholder: 'artifactTemplate.cityTown.politics.placeholder',
      description: 'artifactTemplate.cityTown.politics.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.cityTown.history.title',
      aiPrompt: 'artifactTemplate.cityTown.history.aiPrompt',
      placeholder: 'artifactTemplate.cityTown.history.placeholder',
      description: 'artifactTemplate.cityTown.history.description',
    },
    {
      order: order++,
      type: FieldType.Images,
      title: 'artifactTemplate.cityTown.images.title',
      aiPrompt: 'artifactTemplate.cityTown.images.aiPrompt',
      placeholder: 'artifactTemplate.cityTown.images.placeholder',
      description: 'artifactTemplate.cityTown.images.description',
    },
  ],
} satisfies ArtifactTemplateData;
