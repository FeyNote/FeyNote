import { ArtifactTemplateData } from '../types';

let order = 1;

export const artifactTemplateGenericLocationData = {
  data: {
    title: 'artifactTemplate.genericLocation.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: 'Text',
      title: 'artifactTemplate.genericLocation.name.title',
      aiPrompt: 'artifactTemplate.genericLocation.name.aiPrompt',
      placeholder: 'artifactTemplate.genericLocation.name.placeholder',
      description: 'artifactTemplate.genericLocation.name.description',
      required: true,
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.genericLocation.description.title',
      aiPrompt: 'artifactTemplate.genericLocation.description.aiPrompt',
      placeholder: 'artifactTemplate.genericLocation.description.placeholder',
      description: 'artifactTemplate.genericLocation.description.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.genericLocation.locations.title',
      aiPrompt: 'artifactTemplate.genericLocation.locations.aiPrompt',
      placeholder: 'artifactTemplate.genericLocation.locations.placeholder',
      description: 'artifactTemplate.genericLocation.locations.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.genericLocation.notableNPCs.title',
      aiPrompt: 'artifactTemplate.genericLocation.notableNPCs.aiPrompt',
      placeholder: 'artifactTemplate.genericLocation.notableNPCs.placeholder',
      description: 'artifactTemplate.genericLocation.notableNPCs.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.genericLocation.history.title',
      aiPrompt: 'artifactTemplate.genericLocation.history.aiPrompt',
      placeholder: 'artifactTemplate.genericLocation.history.placeholder',
      description: 'artifactTemplate.genericLocation.history.description',
    },
    {
      order: order++,
      type: 'Images',
      title: 'artifactTemplate.genericLocation.images.title',
      aiPrompt: 'artifactTemplate.genericLocation.images.aiPrompt',
      placeholder: 'artifactTemplate.genericLocation.images.placeholder',
      description: 'artifactTemplate.genericLocation.images.description',
    },
  ],
} satisfies ArtifactTemplateData;
