import {
  createReactInlineContentSpec,
  ReactInlineContentImplementation,
} from '@blocknote/react';
import { CustomInlineContentConfig } from '@blocknote/core';

const config = {
  type: 'artifactReference',
  propSchema: {
    artifactId: {
      default: 'Unknown',
    },
    referenceText: {
      default: 'Unknown',
    },
  },
  content: 'none',
} as const satisfies CustomInlineContentConfig;

export const buildArtifactReferenceSpec = (render: ArtifactReferenceFC) => {
  return createReactInlineContentSpec(config, {
    render,
  });
};

export type ArtifactReferenceFC = ReactInlineContentImplementation<
  typeof config,
  any
>['render'];
