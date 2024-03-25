import { ArtifactTemplateData } from '../types';
import { FieldType } from '@prisma/client';

let order = 1;

export const artifactTemplatePlayerData = {
  data: {
    title: 'artifactTemplate.player.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: FieldType.Text,
      title: 'artifactTemplate.player.name.title',
      aiPrompt: 'artifactTemplate.player.name.aiPrompt',
      placeholder: 'artifactTemplate.player.name.placeholder',
      description: 'artifactTemplate.player.name.description',
      required: true,
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.player.description.title',
      aiPrompt: 'artifactTemplate.player.description.aiPrompt',
      placeholder: 'artifactTemplate.player.description.placeholder',
      description: 'artifactTemplate.player.description.description',
    },
    {
      order: order++,
      type: FieldType.PlayerStatBlock,
      title: 'artifactTemplate.player.statBlock.title',
      aiPrompt: 'artifactTemplate.player.statBlock.aiPrompt',
      placeholder: 'artifactTemplate.player.statBlock.placeholder',
      description: 'artifactTemplate.player.statBlock.description',
    },
    {
      order: order++,
      type: FieldType.Images,
      title: 'artifactTemplate.player.images.title',
      aiPrompt: 'artifactTemplate.player.images.aiPrompt',
      placeholder: 'artifactTemplate.player.images.placeholder',
      description: 'artifactTemplate.player.images.description',
    },
  ],
} satisfies ArtifactTemplateData;
