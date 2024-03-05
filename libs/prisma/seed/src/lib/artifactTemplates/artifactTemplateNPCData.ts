import { ArtifactTemplateData } from '../types';

let order = 1;

export const artifactTemplateNPCData = {
  data: {
    title: 'artifactTemplate.npc.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: 'Text',
      title: 'artifactTemplate.npc.name.title',
      aiPrompt: 'artifactTemplate.npc.name.aiPrompt',
      placeholder: 'artifactTemplate.npc.name.placeholder',
      description: 'artifactTemplate.npc.name.description',
      required: true,
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.npc.description.title',
      aiPrompt: 'artifactTemplate.npc.description.aiPrompt',
      placeholder: 'artifactTemplate.npc.description.placeholder',
      description: 'artifactTemplate.npc.description.description',
    },
    {
      order: order++,
      type: 'NPCStatBlock',
      title: 'artifactTemplate.npc.statBlock.title',
      aiPrompt: 'artifactTemplate.npc.statBlock.aiPrompt',
      placeholder: 'artifactTemplate.npc.statBlock.placeholder',
      description: 'artifactTemplate.npc.statBlock.description',
    },
    {
      order: order++,
      type: 'Images',
      title: 'artifactTemplate.npc.images.title',
      aiPrompt: 'artifactTemplate.npc.images.aiPrompt',
      placeholder: 'artifactTemplate.npc.images.placeholder',
      description: 'artifactTemplate.npc.images.description',
    },
  ],
} satisfies ArtifactTemplateData;
