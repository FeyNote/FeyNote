import { ArtifactTemplateData } from '../types';
import { FieldType } from '@prisma/client';

let order = 1;

export const artifactTemplateReligonData = {
  data: {
    title: 'artifactTemplate.religon.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: FieldType.Text,
      title: 'artifactTemplate.religon.name.title',
      aiPrompt: 'artifactTemplate.religon.name.aiPrompt',
      placeholder: 'artifactTemplate.religon.name.placeholder',
      description: 'artifactTemplate.religon.name.description',
      required: true,
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.religon.description.title',
      aiPrompt: 'artifactTemplate.religon.description.aiPrompt',
      placeholder: 'artifactTemplate.religon.description.placeholder',
      description: 'artifactTemplate.religon.description.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.religon.history.title',
      aiPrompt: 'artifactTemplate.religon.history.aiPrompt',
      placeholder: 'artifactTemplate.religon.history.placeholder',
      description: 'artifactTemplate.religon.history.description',
    },
    {
      order: order++,
      type: FieldType.TextArea,
      title: 'artifactTemplate.religon.notableNPCs.title',
      aiPrompt: 'artifactTemplate.religon.notableNPCs.aiPrompt',
      placeholder: 'artifactTemplate.religon.notableNPCs.placeholder',
      description: 'artifactTemplate.religon.notableNPCs.description',
    },
  ],
} satisfies ArtifactTemplateData;
