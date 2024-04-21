import { ArtifactJson } from '@feynote/prisma/types';

interface RootTemplateLocalizedDetails {
  title: string;
  text: string;
  json: ArtifactJson;
}

interface RootTemplate {
  id: string;
  languages: Record<string, RootTemplateLocalizedDetails>;
}

// TODO: These need love -- just a bit of layout for now
export const worldRootTemplate = {
  id: 'world',
  languages: {
    'en-us': {
      title: 'World',
      text: '',
      json: {},
    },
  },
} satisfies RootTemplate;

export const rootTemplates = [worldRootTemplate] satisfies RootTemplate[];

export const rootTemplatesById = rootTemplates.reduce(
  (acc, rootTemplate) => {
    acc[rootTemplate.id] = rootTemplate;
    return acc;
  },
  {} as Record<string, RootTemplate>,
);
