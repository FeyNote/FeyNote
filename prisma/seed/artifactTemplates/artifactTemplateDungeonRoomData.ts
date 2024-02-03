import { ArtifactTemplateData } from '../types';

let order = 1;

export const artifactTemplateDungeonRoomData = {
  data: {
    title: 'artifactTemplate.dungeonroom.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: 'Text',
      title: 'artifactTemplate.dungeonroom.name.title',
      aiPrompt: 'artifactTemplate.dungeonroom.name.aiPrompt',
      placeholder: 'artifactTemplate.dungeonroom.name.placeholder',
      description: 'artifactTemplate.dungeonroom.name.description',
      required: true,
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.dungeonroom.description.title',
      aiPrompt: 'artifactTemplate.dungeonroom.description.aiPrompt',
      placeholder: 'artifactTemplate.dungeonroom.description.placeholder',
      description: 'artifactTemplate.dungeonroom.description.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.dungeonroom.monsters.title',
      aiPrompt: 'artifactTemplate.dungeonroom.monsters.aiPrompt',
      placeholder: 'artifactTemplate.dungeonroom.monsters.placeholder',
      description: 'artifactTemplate.dungeonroom.monsters.description',
    },
    {
      order: order++,
      type: 'Images',
      title: 'artifactTemplate.dungeonroom.images.title',
      aiPrompt: 'artifactTemplate.dungeonroom.images.aiPrompt',
      placeholder: 'artifactTemplate.dungeonroom.images.placeholder',
      description: 'artifactTemplate.dungeonroom.images.description',
    },
  ],
} satisfies ArtifactTemplateData;
