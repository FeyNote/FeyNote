import Mention, { MentionOptions } from '@tiptap/extension-mention';
import { getReferenceSuggestions } from './getReferenceSuggestions';
import { renderReferenceList } from './renderReferenceList';
import { mergeAttributes } from '@tiptap/core';
import { routes } from '../../../../routes';
import { KnownArtifactReference } from './KnownArtifactReference';

type ReferencePluginOptions = MentionOptions & {
  knownReferences: Map<string, KnownArtifactReference>;
};

export const ReferencesPlugin = Mention.extend<ReferencePluginOptions>({
  name: 'artifactReference',
  addAttributes() {
    return {
      artifactId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-artifact-id'),
        renderHTML: (attributes) => {
          if (!attributes.artifactId) {
            return {};
          }

          return {
            'data-artifact-id': attributes.artifactId,
          };
        },
      },

      artifactBlockId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-artifact-block-id'),
        renderHTML: (attributes) => {
          if (!attributes.artifactId) {
            return {};
          }

          return {
            'data-artifact-block-id': attributes.artifactId,
          };
        },
      },

      referenceText: {
        default: 'Reference',
      },
    };
  },

  addOptions() {
    return {
      ...this.parent?.(),
      knownReferences: new Map(),
    };
  },
}).configure({
  suggestion: {
    items: getReferenceSuggestions,
    render: renderReferenceList,
    char: '@',
    allowSpaces: true,
  },
  renderHTML({ options, node }) {
    const knownReference = this.knownReferences?.get(node.attrs.artifactId);

    return [
      'a',
      mergeAttributes(
        { href: routes.artifact.build({ id: node.attrs.artifactId }) },
        options.HTMLAttributes,
      ),
      `${options.suggestion.char}${knownReference?.referenceText || node.attrs.referenceText}`,
    ];
  },
  renderText({ options, node }) {
    const knownReference = this.knownReferences?.get(node.attrs.artifactId);

    return `${options.suggestion.char}${knownReference?.referenceText || node.attrs.referenceText}`;
  },
});
