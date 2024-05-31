import { BlockNoteSchema, defaultInlineContentSpecs } from '@blocknote/core';
import {
  ArtifactBlockReferenceFC,
  buildArtifactBlockReferenceSpec,
} from './artifactBlockReference';
import {
  ArtifactReferenceFC,
  buildArtifactReferenceSpec,
} from './artifactReference';

interface ArtifactEditorBlocknoteSchemaBuildArgs {
  artifactReferenceFC: ArtifactReferenceFC;
  artifactBlockReferenceFC: ArtifactBlockReferenceFC;
}

/**
 * We use a builder here so that the frontend and backend can both access this, without embedding our frontend components in the blocknote lib (avoid loading JSX/TSX into backend).
 */
export const buildArtifactEditorBlocknoteSchema = (
  buildArgs: ArtifactEditorBlocknoteSchemaBuildArgs,
) =>
  BlockNoteSchema.create({
    inlineContentSpecs: {
      ...defaultInlineContentSpecs,
      artifactReference: buildArtifactReferenceSpec(
        buildArgs.artifactReferenceFC,
      ),
      artifactBlockReference: buildArtifactBlockReferenceSpec(
        buildArgs.artifactBlockReferenceFC,
      ),
    },
  });

export type ArtifactEditorBlock = ReturnType<
  typeof buildArtifactEditorBlocknoteSchema
>['Block'];
