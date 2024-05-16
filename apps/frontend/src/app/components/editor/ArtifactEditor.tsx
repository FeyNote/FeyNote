import { IonCard, useIonToast } from '@ionic/react';
import styled from 'styled-components';
import '@blocknote/core/fonts/inter.css';
import { SuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import {
  EditorReferenceSuggestionItem,
  EditorReferenceMenu,
} from './EditorReferenceMenu';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import {
  ArtifactEditorBlock,
  buildArtifactEditorBlocknoteSchema,
} from '@feynote/blocknote';
import { MutableRefObject, useState } from 'react';
import { ArtifactReference } from './ArtifactReference';
import { ArtifactBlockReference } from './ArtifactBlockReference';

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
  applyTemplateRef: MutableRefObject<ArtifactEditorApplyTemplate | undefined>;
}

export const ArtifactEditor: React.FC<Props> = (props) => {
  const [presentToast] = useIonToast();
  const [referenceSearchText, setReferenceSearchText] = useState('');

  const editor = useCreateBlockNote({
    schema: buildArtifactEditorBlocknoteSchema({
      artifactReferenceFC: ArtifactReference,
      artifactBlockReferenceFC: ArtifactBlockReference,
    }),
    initialContent: props.initialContent,
  });

  const onChange = async () => {
    const md = await editor.blocksToMarkdownLossy();

    props.onContentChange?.(editor.document, md);
  };

  const getMentionItems = async (
    query: string,
  ): Promise<EditorReferenceSuggestionItem[]> => {
    setReferenceSearchText(query);
    const blocks = await trpc.artifact.searchArtifactBlocks
      .query({
        query,
        limit: 15,
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });

    if (!blocks) return [];

    const suggestionItems = [];

    for (const block of blocks) {
      suggestionItems.push({
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
        placeholder: true,
      });
    }

    return suggestionItems;
  };

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
    if (item.placeholder) {
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
      <BlockNoteView editor={editor} onChange={onChange}>
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
