import Mention, { MentionOptions } from '@tiptap/extension-mention';
import { getReferenceSuggestions } from './getReferenceSuggestions';
import { renderReferenceList } from './renderReferenceList';
import { mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ArtifactReferenceNodeView } from './ArtifactReferenceNodeView';
import { t } from 'i18next';
import { getEdgeStore } from '../../../../../utils/edgesReferences/edgeStore';

export type ReferencePluginOptions = MentionOptions & {
  artifactId: string | undefined;
};

// We do this to prevent a hanging @ from triggering the mention menu
// anytime the user navigates close to it. An object is necessary here so that we can pass by reference
const mentionMenuOptsRef = {
  enableMentionMenu: false,
  componentRef: {
    current: null,
  },
};
const keydownListener = (event: KeyboardEvent) => {
  if (event.key === '@') {
    mentionMenuOptsRef.enableMentionMenu = true;
  }
  if (event.key === 'Escape') {
    mentionMenuOptsRef.enableMentionMenu = false;
  }
};
const mouseupListener = () => {
  setTimeout(() => {
    mentionMenuOptsRef.enableMentionMenu = false;
  });
};

export const ArtifactReferencesExtension =
  Mention.extend<ReferencePluginOptions>({
    name: 'artifactReference',

    onCreate() {
      window.removeEventListener('keydown', keydownListener);
      window.removeEventListener('mouseup', mouseupListener);
      window.addEventListener('keydown', keydownListener);
      window.addEventListener('mouseup', mouseupListener);
    },

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
      };
    },

    addNodeView() {
      return ReactNodeViewRenderer(ArtifactReferenceNodeView);
    },
  }).configure({
    suggestion: {
      items: getReferenceSuggestions(mentionMenuOptsRef),
      render: renderReferenceList(mentionMenuOptsRef),
      char: '@',
      allowSpaces: true,
      allow: () => mentionMenuOptsRef.enableMentionMenu,
    },
    renderHTML({ options, node }) {
      const edgeStore = getEdgeStore();
      const edge = this.artifactId
        ? edgeStore.getEdgeInstant({
            artifactId: this.artifactId,
            artifactBlockId: node.attrs.id,
            targetArtifactId: node.attrs.artifactId,
            targetArtifactBlockId: node.attrs.artifactBlockId,
            targetArtifactDate: node.attrs.artifactDate,
          })
        : undefined;

      let displayText = `${options.suggestion.char}${edge?.referenceText || node.attrs.referenceText}`;

      if (node.attrs.artifactDate) {
        displayText += ` ${node.attrs.artifactDate}`;
      }

      return ['span', mergeAttributes({}, options.HTMLAttributes), displayText];
    },
    renderText({ options, node }) {
      const edgeStore = getEdgeStore();
      const edge = this.artifactId
        ? edgeStore.getEdgeInstant({
            artifactId: this.artifactId,
            artifactBlockId: node.attrs.id,
            targetArtifactId: node.attrs.artifactId,
            targetArtifactBlockId: node.attrs.artifactBlockId,
            targetArtifactDate: node.attrs.artifactDate,
          })
        : undefined;

      let displayText = `${options.suggestion.char}${edge?.referenceText || node.attrs.referenceText}`;

      if (node.attrs.artifactDate) {
        displayText += ` ${node.attrs.artifactDate}`;
      }

      return displayText;
    },
  });
