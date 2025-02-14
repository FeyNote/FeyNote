import { mergeAttributes, Node } from '@tiptap/core';
import TableExtension from '@tiptap/extension-table';
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
import { UniqueID } from '@tiptap-pro/extension-unique-id';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import HeadingExtension from '@tiptap/extension-heading';

export const getTiptapServerExtensions = () => {
  return [
    DocumentExtension,
    ParagraphExtension,
    Node.create({
      name: 'blockGroup',
      content: 'block+',
      group: 'block',
      defining: true,
    }),
    HeadingExtension,
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
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right'],
    }),
    DropcursorExtension,
    GapcursorExtension,
    LinkExtension,
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
    }),
    UniqueID.configure({
      types: ['heading', 'paragraph', 'artifactReference'],
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
      addAttributes() {
        return {
          fileId: {
            default: null,
          },
          storageKey: {
            default: null,
          },
          alt: {
            default: null,
          },
          title: {
            default: null,
          },
        };
      },

      parseHTML() {
        return [
          {
            tag: 'img[fileId]',
          },
        ];
      },

      renderHTML({ HTMLAttributes }) {
        const calculatedAttributes = {
          src: this.options.getSrcForFileId(HTMLAttributes['fileId']),
        };
        return [
          'img',
          mergeAttributes(
            this.options.HTMLAttributes,
            HTMLAttributes,
            calculatedAttributes,
          ),
        ];
      },
    }),
    ImageExtension,
  ];
};
