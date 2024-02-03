import { ArtifactTemplateData } from '../types';

let order = 1;

export const artifactTemplateDungeonData = {
  data: {
    title: 'artifactTemplate.dungeon.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: 'Text',
      title: 'artifactTemplate.dungeon.name.title',
      aiPrompt: 'artifactTemplate.dungeon.name.aiPrompt',
      placeholder: 'artifactTemplate.dungeon.name.placeholder',
      description: 'artifactTemplate.dungeon.name.description',
      required: true,
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.dungeon.description.title',
      aiPrompt: 'artifactTemplate.dungeon.description.aiPrompt',
      placeholder: 'artifactTemplate.dungeon.description.placeholder',
      description: 'artifactTemplate.dungeon.description.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.dungeon.monsters.title',
      aiPrompt: 'artifactTemplate.dungeon.monsters.aiPrompt',
      placeholder: 'artifactTemplate.dungeon.monsters.placeholder',
      description: 'artifactTemplate.dungeon.monsters.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.dungeon.rooms.title',
      aiPrompt: 'artifactTemplate.dungeon.rooms.aiPrompt',
      placeholder: 'artifactTemplate.dungeon.rooms.placeholder',
      description: 'artifactTemplate.dungeon.rooms.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.dungeon.history.title',
      aiPrompt: 'artifactTemplate.dungeon.history.aiPrompt',
      placeholder: 'artifactTemplate.dungeon.history.placeholder',
      description: 'artifactTemplate.dungeon.history.description',
    },
    {
      order: order++,
      type: 'Images',
      title: 'artifactTemplate.dungeon.images.title',
      aiPrompt: 'artifactTemplate.dungeon.images.aiPrompt',
      placeholder: 'artifactTemplate.dungeon.images.placeholder',
      description: 'artifactTemplate.dungeon.images.description',
    },
  ],
} satisfies ArtifactTemplateData;
