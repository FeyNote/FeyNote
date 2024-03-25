import { ArtifactTemplateData } from '../types';
import { FieldType } from '@prisma/client';

let order = 1;

export const artifactTemplateQuestData = {
  data: {
    title: 'artifactTemplate.quest.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: FieldType.Text,
      title: 'artifactTemplate.quest.name.title',
      aiPrompt: 'artifactTemplate.quest.name.aiPrompt',
      placeholder: 'artifactTemplate.quest.name.placeholder',
      description: 'artifactTemplate.quest.name.description',
      required: true,
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.quest.description.title',
      aiPrompt: 'artifactTemplate.quest.description.aiPrompt',
      placeholder: 'artifactTemplate.quest.description.placeholder',
      description: 'artifactTemplate.quest.description.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.quest.locations.title',
      aiPrompt: 'artifactTemplate.quest.locations.aiPrompt',
      placeholder: 'artifactTemplate.quest.locations.placeholder',
      description: 'artifactTemplate.quest.locations.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.quest.notableNPCs.title',
      aiPrompt: 'artifactTemplate.quest.notableNPCs.aiPrompt',
      placeholder: 'artifactTemplate.quest.notableNPCs.placeholder',
      description: 'artifactTemplate.quest.notableNPCs.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.quest.items.title',
      aiPrompt: 'artifactTemplate.quest.items.aiPrompt',
      placeholder: 'artifactTemplate.quest.items.placeholder',
      description: 'artifactTemplate.quest.items.description',
    },
  ],
} satisfies ArtifactTemplateData;
