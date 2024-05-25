import { IonCard, useIonToast } from '@ionic/react';
import styled from 'styled-components';
import { SuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import styles from '@blocknote/mantine/style.css?inline';
import {
  EditorReferenceSuggestionItem,
  EditorReferenceMenu,
  EditorReferenceSuggestionItemType,
} from './EditorReferenceMenu';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import {
  ArtifactEditorBlock,
  buildArtifactEditorBlocknoteSchema,
} from '@feynote/blocknote';
import { MutableRefObject, useEffect, useState } from 'react';
import { ArtifactReference } from './ArtifactReference';
import { ArtifactBlockReference } from './ArtifactBlockReference';
import { MonsterSheet } from './sheets/MonsterSheet';
import { filterSuggestionItems } from '@blocknote/core';
import { getSlashMenuItems } from './getSlashMenuItems';
import { HorizontalRule } from './HorizontalRule';
import { SheetEditorExternalFC } from './sheets/SheetEditorExternalFC';
import { SpellSheet } from './sheets/SpellSheet';

const StyledIonCard = styled(IonCard)`
  contain: unset;
  overflow: visible;
  min-height: 500px;

  .ProseMirror h1 {
    font-size: 2rem;
  }

  .ProseMirror h2 {
    font-size: 1.6rem;
  }

  .ProseMirror h3 {
    font-size: 1.2rem;
  }
`;

export type ArtifactEditorApplyTemplate = (
  template: string | ArtifactEditorBlock[],
) => void;

interface Props {
  initialContent?: ArtifactEditorBlock[];
  onContentChange?: (
    updatedContent: ArtifactEditorBlock[],
    updatedContentMd: string,
  ) => void;
  applyTemplateRef?: MutableRefObject<ArtifactEditorApplyTemplate | undefined>;
}

export const ArtifactEditor: React.FC<Props> = (props) => {
  const [presentToast] = useIonToast();
  const [referenceSearchText, setReferenceSearchText] = useState('');

  const editor = useCreateBlockNote({
    schema: buildArtifactEditorBlocknoteSchema({
      artifactReferenceFC: ArtifactReference,
      artifactBlockReferenceFC: ArtifactBlockReference,
      horizontalRuleFC: HorizontalRule,
      monsterSheetFC: MonsterSheet,
      monsterSheetExternalFC: SheetEditorExternalFC,
      spellSheetFC: SpellSheet,
      spellSheetExternalFC: SheetEditorExternalFC,
    }),
    initialContent: props.initialContent,
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      const pos = editor.getTextCursorPosition();
      console.log('keydown');
      if (pos?.block?.type === 'monsterSheet') {
        console.log('keydown in monsterSheet');
        event.preventDefault();
        event.stopPropagation();

        const keyEvent = new KeyboardEvent('keydown', {
          code: 'Enter',
          key: 'Enter',
          shiftKey: true,
          view: window,
          bubbles: false,
        });
        editor.domElement.dispatchEvent(keyEvent);
      }
    }
  };

  useEffect(() => {
    try {
      editor.domElement.addEventListener('keydown', handleKeyDown, true);
      return () =>
        editor.domElement.removeEventListener('keydown', handleKeyDown, true);
    } catch (e) {
      // Do nothing, we don't care if we fail to add the event listener
      // (which can happen if editor.domElement isn't ready since it's a getter)
    }
  });

  const onChange = async () => {
    const md = await editor.blocksToMarkdownLossy();

    props.onContentChange?.(editor.document, md);
  };

  const getMentionItems = async (
    query: string,
  ): Promise<EditorReferenceSuggestionItem[]> => {
    setReferenceSearchText(query);

    const artifactsPromise = trpc.artifact.searchArtifactTitles
      .query({
        query,
        limit: 10,
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
    const blocksPromise = trpc.artifact.searchArtifactBlocks
      .query({
        query,
        limit: 15,
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });

    const [artifacts, blocks] = await Promise.all([
      artifactsPromise,
      blocksPromise,
    ]);

    if (!blocks || !artifacts) return [];

    const suggestionItems = [];

    for (const artifact of artifacts) {
      suggestionItems.push({
        type: EditorReferenceSuggestionItemType.Artifact,
        artifactId: artifact.id,
        artifactBlockId: undefined,
        referenceText: artifact.title,
        artifact: artifact,
        placeholder: false,
      });
    }

    for (const block of blocks) {
      suggestionItems.push({
        type: EditorReferenceSuggestionItemType.ArtifactBlock,
        artifactId: block.artifactId,
        artifactBlockId: block.id,
        referenceText: block.text,
        artifact: block.artifact,
        placeholder: false,
      });
    }

    // We must push an item so that blocknote will keep dialogue open
    if (!suggestionItems.length) {
      suggestionItems.push({
        artifactId: '',
        artifactBlockId: '',
        referenceText: '',
        type: EditorReferenceSuggestionItemType.Placeholder,
      });
    }

    return suggestionItems;
  };

  if (props.applyTemplateRef)
    props.applyTemplateRef.current = async (
      template: string | ArtifactEditorBlock[],
    ) => {
      if (typeof template === 'string') {
        const blocks = await editor.tryParseMarkdownToBlocks(template);
        editor.replaceBlocks(editor.document, blocks);
      } else {
        editor.replaceBlocks(editor.document, template);
      }
    };

  const onItemClick = async (item: EditorReferenceSuggestionItem) => {
    if (item.type === EditorReferenceSuggestionItemType.Placeholder) {
      const artifact = await trpc.artifact.createArtifact.mutate({
        title: referenceSearchText,
        isPinned: false,
        isTemplate: false,
        artifactTemplateId: null,
        rootTemplateId: null,
        text: '',
        json: {
          blocknoteContentMd: '',
          blocknoteContent: undefined,
        },
      });

      editor.insertInlineContent([
        {
          type: 'artifactReference',
          props: {
            artifactId: artifact.id,
            referenceText: referenceSearchText,
            isBroken: false,
          },
        },
        ' ',
      ]);
    } else if (item.artifactBlockId) {
      editor.insertInlineContent([
        {
          type: 'artifactBlockReference',
          props: {
            artifactId: item.artifactId,
            artifactBlockId: item.artifactBlockId,
            referenceText: item.referenceText,
            isBroken: false,
          },
        },
        ' ',
      ]);
    } else {
      editor.insertInlineContent([
        {
          type: 'artifactReference',
          props: {
            artifactId: item.artifactId,
            referenceText: item.referenceText,
            isBroken: false,
          },
        },
        ' ',
      ]);
    }
  };

  return (
    <StyledIonCard onClick={() => editor.focus()}>
      <style type="text/css">{styles}</style>
      <BlockNoteView editor={editor} onChange={onChange} slashMenu={false}>
        <SuggestionMenuController
          triggerCharacter={'/'}
          // Replaces the default Slash Menu items with our custom ones.
          getItems={async (query) =>
            filterSuggestionItems(getSlashMenuItems(editor), query)
          }
        />
        <SuggestionMenuController
          triggerCharacter={'@'}
          onItemClick={onItemClick}
          suggestionMenuComponent={EditorReferenceMenu}
          getItems={getMentionItems}
        />
      </BlockNoteView>
    </StyledIonCard>
  );
};
