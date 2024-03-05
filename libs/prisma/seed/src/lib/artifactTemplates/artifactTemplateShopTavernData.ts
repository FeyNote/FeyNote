import { ArtifactTemplateData } from '../types';

let order = 1;

export const artifactTemplateShopTavernData = {
  data: {
    title: 'artifactTemplate.shopTavern.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: 'Text',
      title: 'artifactTemplate.shopTavern.name.title',
      aiPrompt: 'artifactTemplate.shopTavern.name.aiPrompt',
      placeholder: 'artifactTemplate.shopTavern.name.placeholder',
      description: 'artifactTemplate.shopTavern.name.description',
      required: true,
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.shopTavern.description.title',
      aiPrompt: 'artifactTemplate.shopTavern.description.aiPrompt',
      placeholder: 'artifactTemplate.shopTavern.description.placeholder',
      description: 'artifactTemplate.shopTavern.description.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.shopTavern.items.title',
      aiPrompt: 'artifactTemplate.shopTavern.items.aiPrompt',
      placeholder: 'artifactTemplate.shopTavern.items.placeholder',
      description: 'artifactTemplate.shopTavern.items.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.shopTavern.notableNPCs.title',
      aiPrompt: 'artifactTemplate.shopTavern.notableNPCs.aiPrompt',
      placeholder: 'artifactTemplate.shopTavern.notableNPCs.placeholder',
      description: 'artifactTemplate.shopTavern.notableNPCs.description',
    },
    {
      order: order++,
      type: 'Images',
      title: 'artifactTemplate.shopTavern.images.title',
      aiPrompt: 'artifactTemplate.shopTavern.images.aiPrompt',
      placeholder: 'artifactTemplate.shopTavern.images.placeholder',
      description: 'artifactTemplate.shopTavern.images.description',
    },
  ],
} satisfies ArtifactTemplateData;
