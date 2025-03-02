import type { YArtifactMeta } from '@feynote/global-types';
import { JSONContent } from '@tiptap/core';
import { templateBuilderHelper } from './templateBuilderHelper';
import { t } from 'i18next';

export const buildIntroducingReferencesArtifact = () => {
  const meta = {
    title: t('template.introducingReferences.title'),
    theme: 'default',
    type: 'tiptap',
    titleBodyMerge: true,
    linkAccessLevel: 'noaccess',
  } as const satisfies YArtifactMeta;

  const incomingReferenceBlockId = crypto.randomUUID();

  const jsonContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.introducingReferences.p1'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.introducingReferences.p2'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: incomingReferenceBlockId,
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.introducingReferences.reference'),
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          id: crypto.randomUUID(),
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: t('template.introducingReferences.p3'),
          },
        ],
      },
    ],
  } satisfies JSONContent;

  return {
    result: templateBuilderHelper(meta, jsonContent),
    meta: {
      incomingReferenceBlockId,
    },
  };
};
