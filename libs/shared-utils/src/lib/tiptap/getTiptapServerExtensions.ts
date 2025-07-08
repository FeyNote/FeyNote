import { Mark, mergeAttributes, Node } from '@tiptap/core';
import TableExtension from '@tiptap/extension-table';
import HighlightExtension from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import Code from '@tiptap/extension-code';
import Mention from '@tiptap/extension-mention';
import ParagraphExtension from '@tiptap/extension-paragraph';
import BlockquoteExtension from '@tiptap/extension-blockquote';
import ListItemExtension from '@tiptap/extension-list-item';
import OrderedListExtension from '@tiptap/extension-ordered-list';
import BulletListExtension from '@tiptap/extension-bullet-list';
import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';
import HardBreakExtension from '@tiptap/extension-hard-break';
import BoldExtension from '@tiptap/extension-bold';
import FontFamilyExtension from '@tiptap/extension-font-family';
import TextStyleExtension from '@tiptap/extension-text-style';
import ItalicExtension from '@tiptap/extension-italic';
import StrikeExtension from '@tiptap/extension-strike';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlignExtension from '@tiptap/extension-text-align';
import DropcursorExtension from '@tiptap/extension-dropcursor';
import GapcursorExtension from '@tiptap/extension-gapcursor';
import TableRowExtension from '@tiptap/extension-table-row';
import TableHeaderExtension from '@tiptap/extension-table-header';
import TableCellExtension from '@tiptap/extension-table-cell';
import DocumentExtension from '@tiptap/extension-document';
import TextExtension from '@tiptap/extension-text';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { UniqueID } from '@tiptap/extension-unique-id';
import HeadingExtension from '@tiptap/extension-heading';
import { FeynoteEditorMediaType } from '../types/FeynoteEditorMediaType';
import { TiptapBlockType } from './TiptapBlockType';

interface Props {
  userFileToS3Map?: Map<string, string>;
}

export const getTiptapServerExtensions = (props: Props) => {
  return [
    DocumentExtension,
    ParagraphExtension,
    Mark.create({
      name: 'link',

      priority: 1000,

      keepOnSplit: false,
      inclusive() {
        return this.options.autoHyperlink;
      },

      addOptions() {
        return {
          openOnClick: true,
          hyperlinkOnPaste: true,
          autoHyperlink: true,
          protocols: [],
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer nofollow',
            class: '',
          },
          modals: {
            previewHyperlink: null,
            setHyperlink: null,
          },
          validate: undefined,
        };
      },

      addAttributes() {
        return {
          href: {
            default: null,
          },
          target: {
            default: this.options.HTMLAttributes.target,
          },
          class: {
            default: this.options.HTMLAttributes.class,
          },
        };
      },

      parseHTML() {
        return [{ tag: 'a[href]:not([href *= "javascript:" i])' }];
      },

      renderHTML({ HTMLAttributes }) {
        return [
          'a',
          mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
          0,
        ];
      },
    }),
    Node.create({
      name: 'blockGroup',
      content: 'block+',
      group: 'block',
      defining: true,
      parseHTML() {
        return [
          {
            tag: 'div',
            getAttrs: (node) =>
              node.getAttribute('data-content-type') === this.name && {
                'data-content-type': node.getAttribute('data-content-type'),
              },
          },
        ];
      },
      renderHTML({ HTMLAttributes }) {
        const attrs = mergeAttributes(
          this.options.HTMLAttributes,
          HTMLAttributes,
          {
            'data-content-type': this.name,
          },
        );
        return ['ul', ['li', attrs, 0]];
      },
    }),
    HeadingExtension,
    HighlightExtension,
    CodeBlock,
    Code,
    TextExtension,
    HorizontalRule,
    BlockquoteExtension,
    ListItemExtension,
    OrderedListExtension,
    BulletListExtension,
    TextStyleExtension,
    FontFamilyExtension,
    TaskListExtension,
    TaskItemExtension.configure({
      nested: true,
    }),
    HardBreakExtension,
    BoldExtension,
    ItalicExtension,
    StrikeExtension,
    UnderlineExtension,
    TextAlignExtension.configure({
      types: [TiptapBlockType.Heading, TiptapBlockType.Paragraph],
      alignments: ['left', 'center', 'right'],
    }),
    DropcursorExtension,
    GapcursorExtension,
    TableExtension,
    TableRowExtension,
    TableHeaderExtension,
    TableCellExtension,
    Mention.extend({
      name: 'artifactReference',

      addAttributes() {
        return {
          artifactId: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-artifact-id'),
            renderHTML: (attributes) => {
              if (!attributes['artifactId']) {
                return {};
              }

              return {
                'data-artifact-id': attributes['artifactId'],
              };
            },
          },

          artifactBlockId: {
            default: null,
            parseHTML: (element) =>
              element.getAttribute('data-artifact-block-id'),
            renderHTML: (attributes) => {
              if (!attributes['artifactId']) {
                return {};
              }

              return {
                'data-artifact-block-id': attributes['artifactId'],
              };
            },
          },

          artifactDate: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-artifact-date'),
            renderHTML: (attributes) => {
              if (!attributes['artifactDate']) {
                return {};
              }

              return {
                'data-artifact-date': attributes['artifactDate'],
              };
            },
          },

          referenceText: {
            default: '',
            parseHTML: (element) =>
              element.getAttribute('data-artifact-reference-text'),
            renderHTML: (attributes) => {
              if (!attributes['referenceText']) {
                return {};
              }

              return {
                'data-artifact-reference-text': attributes['referenceText'],
              };
            },
          },
        };
      },
    }).configure({
      renderHTML({ options, node }) {
        let displayText = `{{${node.attrs['referenceText']} ${node.attrs['artifactId']}}}`;

        if (node.attrs['artifactDate']) {
          displayText += ` ${node.attrs['artifactDate']}`;
        }

        return [
          'span',
          mergeAttributes({}, options.HTMLAttributes),
          displayText,
        ];
      },
      renderText({ options, node }) {
        let displayText = `${options.suggestion.char}${node.attrs['referenceText']}`;

        if (node.attrs['artifactDate']) {
          displayText += ` ${node.attrs['artifactDate']}`;
        }

        return displayText;
      },
    }),
    UniqueID.configure({
      types: [
        TiptapBlockType.Heading,
        TiptapBlockType.Paragraph,
        TiptapBlockType.ArtifactReference,
      ],
    }),
    Node.create({
      name: 'customMonsterStatblock',
      content: '(paragraph|list|heading|horizontalRule|table)+',
      group: 'block',
      defining: true,
      isolating: true,

      addAttributes() {
        return {
          wide: {
            default: false,
            parseHTML: (element) => element.getAttribute('data-wide'),
            renderHTML: (attributes) => {
              return {
                'data-wide': attributes['wide'],
              };
            },
          },
        };
      },
      parseHTML() {
        return [
          {
            tag: 'div',
            getAttrs: (node) =>
              node.hasAttribute('data-monster-statblock') && {
                'data-monster-statblock': node.getAttribute(
                  'data-monster-statblock',
                ),
              },
          },
        ];
      },

      renderHTML({ HTMLAttributes }) {
        const attrs = mergeAttributes(
          this.options.HTMLAttributes,
          HTMLAttributes,
          {
            'data-monster-statblock': 'v1',
          },
        );
        return ['div', attrs, 0];
      },
    }),
    Node.create({
      name: 'customSpellSheet',
      content: '(paragraph|list|heading|horizontalRule|table)+',
      group: 'block',
      defining: true,
      isolating: true,

      parseHTML() {
        return [
          {
            tag: 'div',
            getAttrs: (node) =>
              node.hasAttribute('data-spellsheet') && {
                'data-spellsheet': node.getAttribute('data-spellsheet'),
              },
          },
        ];
      },

      renderHTML({ HTMLAttributes }) {
        const attrs = mergeAttributes(
          this.options.HTMLAttributes,
          HTMLAttributes,
          {
            'data-spellsheet': 'v1',
          },
        );
        return ['div', attrs, 0];
      },
    }),
    Node.create({
      name: 'customTTRPGNote',
      content: '(heading|paragraph|list|horizontalRule|table)+',
      group: 'block',
      defining: true,
      isolating: true,

      parseHTML() {
        return [
          {
            tag: 'div',
            getAttrs: (node) =>
              node.hasAttribute('data-ttrpg-note') && {
                'data-ttrpg-note': node.getAttribute('data-ttrpg-note'),
              },
          },
        ];
      },

      renderHTML({ HTMLAttributes }) {
        const attrs = mergeAttributes(HTMLAttributes, {
          'data-ttrpg-note': 'v1',
        });
        return ['div', attrs, 0];
      },
    }),
    Node.create({
      name: 'feynoteImage',
      group() {
        return this.options.inline ? 'inline' : 'block';
      },
      addAttributes() {
        return {
          fileId: {
            parseHTML: (element) => element.getAttribute('data-file-id'),
            default: null,
          },
          storageKey: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-storage-key'),
          },
          alt: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-alt'),
          },
          title: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-title'),
          },
        };
      },
      parseHTML() {
        return [
          {
            tag: `div[data-media-type="${FeynoteEditorMediaType.Image}"]`,
          },
        ];
      },
      addOptions() {
        return {
          minWidthPx: 60,
          minHeightPx: 60,
          HTMLAttributes: {},
          getSrcForFileId: () => '',
        };
      },
      renderHTML({ HTMLAttributes }) {
        const fileId = HTMLAttributes['fileId'];
        const alt =
          HTMLAttributes['alt'] ||
          HTMLAttributes['title'] ||
          HTMLAttributes['fileId'];
        let src = this.options.getSrcForFileId(fileId);
        if (props.userFileToS3Map?.has(fileId)) {
          src = props.userFileToS3Map.get(fileId);
        }

        return [
          'img',
          mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
            src,
            alt,
          }),
        ];
      },
    }),
  ];
};
