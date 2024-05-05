import { CustomInlineContentConfig } from '@blocknote/core';
import {
  createReactInlineContentSpec,
  ReactInlineContentImplementation,
} from '@blocknote/react';

const config = {
  type: 'artifactBlockReference',
  propSchema: {
    artifactId: {
      default: 'Unknown',
    },
    artifactBlockId: {
      default: 'Unknown',
    },
    referenceText: {
      default: 'Unknown',
    },
  },
  content: 'none',
} as const satisfies CustomInlineContentConfig;

export const buildArtifactBlockReferenceSpec = (
  render: ArtifactBlockReferenceFC,
) => {
  return createReactInlineContentSpec(config, {
    render,
  });
};

export type ArtifactBlockReferenceFC = ReactInlineContentImplementation<
  typeof config,
  any
>['render'];
