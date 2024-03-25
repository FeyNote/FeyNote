import { FieldType } from '@prisma/client';
import { ArtifactTemplateData } from '../types';

let order = 1;

export const artifactTemplateWorldData = {
  data: {
    title: 'artifactTemplate.world.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: FieldType.Text,
      title: 'artifactTemplate.world.name.title',
      aiPrompt: 'artifactTemplate.world.name.aiPrompt',
      placeholder: 'artifactTemplate.world.name.placeholder',
      description: 'artifactTemplate.world.name.description',
      required: true,
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.world.description.title',
      aiPrompt: 'artifactTemplate.world.description.aiPrompt',
      placeholder: 'artifactTemplate.world.description.placeholder',
      description: 'artifactTemplate.world.description.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.world.continents.title',
      aiPrompt: 'artifactTemplate.world.continents.aiPrompt',
      placeholder: 'artifactTemplate.world.continents.placeholder',
      description: 'artifactTemplate.world.continents.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.world.history.title',
      aiPrompt: 'artifactTemplate.world.history.aiPrompt',
      placeholder: 'artifactTemplate.world.history.placeholder',
      description: 'artifactTemplate.world.history.description',
    },
    {
      order: order++,
      type: FieldType.Images,
      title: 'artifactTemplate.world.images.title',
      aiPrompt: 'artifactTemplate.world.images.aiPrompt',
      placeholder: 'artifactTemplate.world.images.placeholder',
      description: 'artifactTemplate.world.images.description',
    },
  ],
} satisfies ArtifactTemplateData;
