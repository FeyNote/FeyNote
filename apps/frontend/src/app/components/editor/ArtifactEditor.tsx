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
  EditorReferenceSuggestionItem,
  EditorReferenceMenuComponent,
} from './EditorSuggestion';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import {
  ArtifactEditorBlock,
  buildArtifactEditorBlocknoteSchema,
} from '@feynote/blocknote';
import { MutableRefObject, useEffect, useRef } from 'react';
import { ArtifactReference } from './ArtifactReference';
import { ArtifactBlockReference } from './ArtifactBlockReference';
import { ArtifactDetail } from '@feynote/prisma/types';
import { getReferencesFromProsemirrorPasteFragment } from './getReferencesFromProseMirrorPasteFragment';
import { Reference } from './Reference';
import { RerenderManager } from './rerenderManager';

const StyledIonCard = styled(IonCard)`
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
  onReferencesPasted: (references: {
    artifactId: string,
    artifactBlockId?: string,
  }[]) => void;
  applyTemplateRef: MutableRefObject<ArtifactEditorApplyTemplate | undefined>;
  knownReferences: Map<string, Reference>;
}

export const ArtifactEditor: React.FC<Props> = (props) => {
  const [presentToast] = useIonToast();

  const blocknoteRerenderManager = useRef(new RerenderManager());

  const editor = useCreateBlockNote({
    _tiptapOptions: {
      editorProps: {
        handlePaste: (
          view,
          event,
          slice
        ) => {
          const rootFragment = slice.content;
          const pastedReferences = getReferencesFromProsemirrorPasteFragment(rootFragment);
          props.onReferencesPasted(pastedReferences);
        }
      }
    },
    schema: buildArtifactEditorBlocknoteSchema({
      artifactReferenceFC: (_props) => (
        <ArtifactReference {..._props} knownReferences={props.knownReferences} blocknoteRerenderManager={blocknoteRerenderManager.current} />
      ),
      artifactBlockReferenceFC: (_props) => (
        <ArtifactBlockReference {..._props} knownReferences={props.knownReferences} blocknoteRerenderManager={blocknoteRerenderManager.current} />
      ),
    }),
    initialContent: props.initialContent,
  });

  useEffect(() => {
    blocknoteRerenderManager.current.call();
  }, [props.knownReferences]);

  const onChange = async () => {
    const md = await editor.blocksToMarkdownLossy();

    props.onContentChange?.(editor.document, md);
  };

  const getMentionItems = async (
    query: string,
  ): Promise<EditorReferenceSuggestionItem[]> => {
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

  return (
    <StyledIonCard onClick={() => editor.focus()}>
      <BlockNoteView editor={editor} onChange={onChange}>
        <SuggestionMenuController
          triggerCharacter={'@'}
          onItemClick={(item) => {
            if (item.artifactBlockId) {
              editor.insertInlineContent([
                {
                  type: 'artifactBlockReference',
                  props: {
                    artifactId: item.artifactId,
                    artifactBlockId: item.artifactBlockId,
                    referenceText: item.referenceText,
                  },
                },
                ' ', // add a space after
              ]);
            } else {
              editor.insertInlineContent([
                {
                  type: 'artifactReference',
                  props: {
                    artifactId: item.artifactId,
                    referenceText: item.referenceText,
                  },
                },
                ' ', // add a space after
              ]);
            }
          }}
          suggestionMenuComponent={EditorReferenceMenuComponent}
          getItems={getMentionItems}
        />
      </BlockNoteView>
    </StyledIonCard>
  );
};
