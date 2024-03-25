import { ArtifactTemplateData } from '../types';
import { FieldType } from '@prisma/client';

let order = 1;

export const artifactTemplateItemData = {
  data: {
    title: 'artifactTemplate.item.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: FieldType.Text,
      title: 'artifactTemplate.item.name.title',
      aiPrompt: 'artifactTemplate.item.name.aiPrompt',
      placeholder: 'artifactTemplate.item.name.placeholder',
      description: 'artifactTemplate.item.name.description',
      required: true,
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.item.description.title',
      aiPrompt: 'artifactTemplate.item.description.aiPrompt',
      placeholder: 'artifactTemplate.item.description.placeholder',
      description: 'artifactTemplate.item.description.description',
    },
    {
      order: order++,
      type: FieldType.ItemStatBlock,
      title: 'artifactTemplate.item.statBlock.title',
      aiPrompt: 'artifactTemplate.item.statBlock.aiPrompt',
      placeholder: 'artifactTemplate.item.statBlock.placeholder',
      description: 'artifactTemplate.item.statBlock.description',
    },
    {
      order: order++,
      type: FieldType.Images,
      title: 'artifactTemplate.item.images.title',
      aiPrompt: 'artifactTemplate.item.images.aiPrompt',
      placeholder: 'artifactTemplate.item.images.placeholder',
      description: 'artifactTemplate.item.images.description',
    },
  ],
} satisfies ArtifactTemplateData;
