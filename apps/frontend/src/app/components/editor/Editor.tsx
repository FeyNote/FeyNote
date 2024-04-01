import { IonCard } from '@ionic/react';
import styled from 'styled-components';
import '@blocknote/core/fonts/inter.css';
import { Block, PartialBlock } from '@blocknote/core';
import { BlockNoteView, useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';

const StyledIonCard = styled(IonCard)`
  min-height: 500px;
`;

interface Props {
  initialContent?: PartialBlock[] | Block[];
  onContentChange?: (updatedContent: Block[], updatedContentMd: string) => void;
}

export const Editor = (props: Props) => {
  const editor = useCreateBlockNote({
    initialContent: props.initialContent,
  });

  const onChange = async () => {
    const md = await editor.blocksToMarkdownLossy();

    props.onContentChange?.(editor.document, md);
  };

  return (
    <StyledIonCard>
      <BlockNoteView editor={editor} onChange={onChange} />
    </StyledIonCard>
  );
};
