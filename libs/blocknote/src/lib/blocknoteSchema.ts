import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from '@blocknote/core';
import {
  ArtifactBlockReferenceFC,
  buildArtifactBlockReferenceSpec,
} from './artifactBlockReference';
import {
  ArtifactReferenceFC,
  buildArtifactReferenceSpec,
} from './artifactReference';
import { MonsterSheetFC, buildMonsterSheetSpec } from './monsterSheet';
import { HorizontalRuleFC, buildHorizontalRuleSpec } from './horizontalRule';

interface ArtifactEditorBlocknoteSchemaBuildArgs {
  artifactReferenceFC: ArtifactReferenceFC;
  artifactBlockReferenceFC: ArtifactBlockReferenceFC;
  horizontalRuleFC: HorizontalRuleFC;
  monsterSheetFC: MonsterSheetFC;
  monsterSheetExternalFC?: MonsterSheetFC;
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
    blockSpecs: {
      ...defaultBlockSpecs,
      horizontalRule: buildHorizontalRuleSpec(buildArgs.horizontalRuleFC),
      monsterSheet: buildMonsterSheetSpec(
        buildArgs.monsterSheetFC,
        buildArgs.monsterSheetExternalFC,
      ),
    },
  });

export type ArtifactEditorPartialBlock = ReturnType<
  typeof buildArtifactEditorBlocknoteSchema
>['PartialBlock'];

export type ArtifactEditorBlock = ReturnType<
  typeof buildArtifactEditorBlocknoteSchema
>['Block'];

export type ArtifactEditor = ReturnType<
  typeof buildArtifactEditorBlocknoteSchema
>['BlockNoteEditor'];
