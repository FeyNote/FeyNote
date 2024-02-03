import { ArtifactTemplateData } from '../types';

let order = 1;

export const artifactTemplateRegionData = {
  data: {
    title: 'artifactTemplate.region.title',
    visibility: 'Public',
  },
  fields: [
    {
      order: order++,
      type: 'Text',
      title: 'artifactTemplate.region.name.title',
      aiPrompt: 'artifactTemplate.region.name.aiPrompt',
      placeholder: 'artifactTemplate.region.name.placeholder',
      description: 'artifactTemplate.region.name.description',
      required: true,
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.region.description.title',
      aiPrompt: 'artifactTemplate.region.description.aiPrompt',
      placeholder: 'artifactTemplate.region.description.placeholder',
      description: 'artifactTemplate.region.description.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.region.locations.title',
      aiPrompt: 'artifactTemplate.region.locations.aiPrompt',
      placeholder: 'artifactTemplate.region.locations.placeholder',
      description: 'artifactTemplate.region.locations.description',
    },
    {
      order: order++,
      type: 'TextArea',
      title: 'artifactTemplate.region.history.title',
      aiPrompt: 'artifactTemplate.region.history.aiPrompt',
      placeholder: 'artifactTemplate.region.history.placeholder',
      description: 'artifactTemplate.region.history.description',
    },
    {
      order: order++,
      type: 'Images',
      title: 'artifactTemplate.region.images.title',
      aiPrompt: 'artifactTemplate.region.images.aiPrompt',
      placeholder: 'artifactTemplate.region.images.placeholder',
      description: 'artifactTemplate.region.images.description',
    },
  ],
} satisfies ArtifactTemplateData;
