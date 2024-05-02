import { IonContent } from '@ionic/react';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { useMemo } from 'react';
import styled from 'styled-components';
import { AIMessageBlock } from './AIMessageBlock';

const ContentContainer = styled(IonContent)`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

interface Props {
  messages: ChatCompletionMessageParam[];
}

export const AIMessagesContainer = (props: Props) => {
  const messageBlocks = useMemo(() => {
    if (!props.messages.length) return [];
    const messageBlocks: ChatCompletionMessageParam[][] = [];
    let messageBlock: ChatCompletionMessageParam[] = [];
    let previousMessage: ChatCompletionMessageParam | null = null;

    props.messages.forEach((message) => {
      if (!previousMessage || previousMessage.role === message.role) {
        messageBlock.push(message);
      } else {
        messageBlocks.push(messageBlock);
        messageBlock = [message];
      }
      previousMessage = message;
    });
    messageBlocks.push(messageBlock);
    return messageBlocks;
  }, [props.messages]);

  return (
    <ContentContainer>
      {messageBlocks.map((messageBlock, idx) => {
        const id = 'message-block' + idx;
        if (idx === messageBlocks.length - 1) {
          return (
            <AIMessageBlock id={id} key={id} messageBlock={messageBlock} />
          );
        }
        return <AIMessageBlock id={id} key={id} messageBlock={messageBlock} />;
      })}
    </ContentContainer>
  );
};
