import { IonCard, useIonToast } from '@ionic/react';
import styled from 'styled-components';
import '@blocknote/core/fonts/inter.css';
import {
  BlockNoteView,
  SuggestionMenuController,
  useCreateBlockNote,
} from '@blocknote/react';
import '@blocknote/react/style.css';
import {
  EditorSuggestionItem,
  EditorSuggestionMenuComponent,
} from './EditorSuggestion';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import {
  ArtifactEditorBlock,
  artifactEditorBlocknoteSchema,
} from './blocknoteSchema';

const StyledIonCard = styled(IonCard)`
  min-height: 500px;
`;

interface Props {
  initialContent?: ArtifactEditorBlock[];
  onContentChange?: (
    updatedContent: ArtifactEditorBlock[],
    updatedContentMd: string,
  ) => void;
}

export const ArtifactEditor = (props: Props) => {
  const [presentToast] = useIonToast();
  const editor = useCreateBlockNote({
    schema: artifactEditorBlocknoteSchema,
    initialContent: props.initialContent,
  });

  const onChange = async () => {
    const md = await editor.blocksToMarkdownLossy();

    props.onContentChange?.(editor.document, md);
  };

  const getMentionItems = async (
    query: string,
  ): Promise<EditorSuggestionItem[]> => {
    const blocks = await trpc.artifact.searchArtifactBlocks
      .query({
        query,
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });

    if (!blocks) return [];

    const suggestionItems = [];

    for (const block of blocks) {
      suggestionItems.push({
        id: block.block.id,
        displayName: block.matchedText,
      });
    }

    // We must push an item so that blocknote will keep dialogue open
    if (!suggestionItems.length) {
      suggestionItems.push({
        id: '',
        displayName: '',
      });
    }

    return suggestionItems;
  };

  return (
    <StyledIonCard onClick={() => editor.focus()}>
      <BlockNoteView editor={editor} onChange={onChange}>
        <SuggestionMenuController
          triggerCharacter={'@'}
          onItemClick={(item) => {
            editor.insertInlineContent([
              {
                type: 'artifactBlockReference',
                props: {
                  artifactBlockId: item.id,
                  artifactBlockReferenceText: item.displayName,
                },
              },
              ' ', // add a space after
            ]);
          }}
          suggestionMenuComponent={EditorSuggestionMenuComponent}
          getItems={getMentionItems}
        />
      </BlockNoteView>
    </StyledIonCard>
  );
};
