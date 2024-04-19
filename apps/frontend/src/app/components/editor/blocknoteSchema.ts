import { BlockNoteSchema, defaultInlineContentSpecs } from '@blocknote/core';
import { artifactBlockReference } from './artifactBlockReference';

export const artifactEditorBlocknoteSchema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    artifactBlockReference,
  },
});

export type ArtifactEditorBlock = typeof artifactEditorBlocknoteSchema.Block;
