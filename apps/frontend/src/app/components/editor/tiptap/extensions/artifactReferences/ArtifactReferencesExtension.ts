import Mention, { MentionOptions } from '@tiptap/extension-mention';
import { getReferenceSuggestions } from './getReferenceSuggestions';
import { renderReferenceList } from './renderReferenceList';
import { mergeAttributes } from '@tiptap/core';
import { routes } from '../../../../../routes';
import { KnownArtifactReference } from './KnownArtifactReference';
import { getKnownArtifactReferenceKey } from './getKnownArtifactReferenceKey';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ArtifactReferenceNodeView } from './ArtifactReferenceNodeView';
import { t } from 'i18next';

export type ReferencePluginOptions = MentionOptions & {
  knownReferences: Map<string, KnownArtifactReference>;
};

export const ArtifactReferencesExtension =
  Mention.extend<ReferencePluginOptions>({
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
          parseHTML: (element) =>
            element.getAttribute('data-artifact-block-id'),
          renderHTML: (attributes) => {
            if (!attributes.artifactId) {
              return {};
            }

            return {
              'data-artifact-block-id': attributes.artifactId,
            };
          },
        },

        artifactDate: {
          default: null,
          parseHTML: (element) => element.getAttribute('data-artifact-date'),
          renderHTML: (attributes) => {
            if (!attributes.artifactDate) {
              return {};
            }

            return {
              'data-artifact-date': attributes.artifactDate,
            };
          },
        },

        referenceText: {
          default: t('editor.emptyReference'),
          parseHTML: (element) =>
            element.getAttribute('data-artifact-reference-text'),
          renderHTML: (attributes) => {
            if (!attributes.referenceText) {
              return {};
            }

            return {
              'data-artifact-reference-text': attributes.referenceText,
            };
          },
        },
      };
    },

    addOptions() {
      return {
        ...this.parent?.(),
        knownReferences: new Map(),
      };
    },

    addNodeView() {
      return ReactNodeViewRenderer(ArtifactReferenceNodeView);
    },
  }).configure({
    suggestion: {
      items: getReferenceSuggestions,
      render: renderReferenceList,
      char: '@',
      allowSpaces: true,
    },
    renderHTML({ options, node }) {
      const key = getKnownArtifactReferenceKey(
        node.attrs.artifactId,
        node.attrs.artifactBlockId || undefined,
        node.attrs.artifactDate || undefined,
      );
      const knownReference = this.knownReferences?.get(key);

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
      const key = getKnownArtifactReferenceKey(
        node.attrs.artifactId,
        node.attrs.artifactBlockId || undefined,
        node.attrs.artifactDate || undefined,
      );
      const knownReference = this.knownReferences?.get(key);

      return `${options.suggestion.char}${knownReference?.referenceText || node.attrs.referenceText}`;
    },
  });
