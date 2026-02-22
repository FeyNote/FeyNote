import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { AIMessageContent } from './AIMessageContent';
import type { FeynoteUIMessage } from '@feynote/shared-utils';
import type { ChatStatus } from 'ai';
import { Spinner } from '@radix-ui/themes';

const Scroller = styled.div<{
  $visible: boolean;
}>`
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: auto;
  overflow-anchor: none;
  position: relative;
  border-bottom: 2px solid var(--ion-border-color);

  ${(props) => (props.$visible ? '' : 'visibility: hidden;')}
`;

const UserMessageContainer = styled.div`
  margin-left: auto;
  max-width: 80%;
  background: var(--ion-background-color-step-100);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  margin-right: 1.5rem;
  line-height: 1.5rem;
`;

const AssistantMessageContainer = styled.div`
  width: 100%;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  line-height: 1.5rem;
`;

const ThinkingContainer = styled.div`
  width: 100%;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  line-height: 1.5rem;
`;

interface Props {
  messages: FeynoteUIMessage[];
  aiStatus: ChatStatus;
  updateMessage: (message: FeynoteUIMessage) => void;
  retryMessage: (messageId: string) => void;
}

const findLastUserMessageIdx = (messages: FeynoteUIMessage[]) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return i;
  }
  return -1;
};

export const AIMessagesContainer = (props: Props) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastScrolledUserMsgIdRef = useRef<string | null>(null);
  const messagesRef = useRef(props.messages);
  const [initialScrollOccurred, setInitialScrollOccurred] = useState(false);
  const initialScrollOccurredRef = useRef(initialScrollOccurred);
  initialScrollOccurredRef.current = initialScrollOccurred;
  messagesRef.current = props.messages;

  const recalculateSpacer = () => {
    // These values must all use refs since this method is called from the ResizeObserver
    // which does not re-register on component re-renders
    const scroller = scrollerRef.current;
    const spacer = spacerRef.current;
    const messages = messagesRef.current;
    const content = contentRef.current;
    const lastUserIdx = findLastUserMessageIdx(messages);

    if (
      !scroller ||
      !spacer ||
      !messages.length ||
      !content ||
      lastUserIdx < 0
    ) {
      if (spacer) {
        spacer.style.height = '0px';
        spacer.style.minHeight = '0px';
      }
      return;
    }

    const lastUserMessageEl = content.querySelector<HTMLElement>(
      `[data-message-id="${messages[lastUserIdx].id}"]`,
    );
    const lastMessageEl = content.querySelector<HTMLElement>(
      `[data-message-id="${messages[messages.length - 1].id}"]`,
    );
    if (!lastUserMessageEl || !lastMessageEl) return;

    const scrollerHeight = scroller.clientHeight;
    const userMessageTop = lastUserMessageEl.offsetTop;
    const lastMessageBottom =
      lastMessageEl.offsetTop + lastMessageEl.offsetHeight;
    const heightInView = lastMessageBottom - userMessageTop;
    const heightPx = `${Math.max(0, scrollerHeight - heightInView)}px`;

    spacer.style.height = heightPx;
    spacer.style.minHeight = heightPx;
  };

  useLayoutEffect(() => {
    recalculateSpacer();

    const scroller = scrollerRef.current;
    if (!scroller || !props.messages.length) return;

    const lastUserMessageIdx = findLastUserMessageIdx(props.messages);
    const lastUserMessage =
      lastUserMessageIdx >= 0 ? props.messages[lastUserMessageIdx] : null;

    if (
      !initialScrollOccurredRef.current ||
      !lastUserMessage ||
      lastUserMessage.id === lastScrolledUserMsgIdRef.current
    ) {
      return;
    }
    lastScrolledUserMsgIdRef.current = lastUserMessage.id;

    const lastUserMessageEl = contentRef.current?.querySelector<HTMLElement>(
      `[data-message-id="${lastUserMessage.id}"]`,
    );
    if (!lastUserMessageEl) return;

    scroller.scrollTop = lastUserMessageEl.offsetTop;
  }, [props.messages]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(recalculateSpacer);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    setTimeout(() => {
      setInitialScrollOccurred(true);
      const scroller = scrollerRef.current;
      if (!scroller) return;
      scroller.scrollTop = scroller.scrollHeight;
    });
  }, []);

  const renderMessage = (message: FeynoteUIMessage) => {
    const isUser = message.role === 'user';
    const Container = isUser ? UserMessageContainer : AssistantMessageContainer;
    return (
      <Container key={message.id} data-message-id={message.id}>
        <AIMessageContent
          message={message}
          aiStatus={props.aiStatus}
          retryMessage={props.retryMessage}
          updateMessage={props.updateMessage}
        />
      </Container>
    );
  };

  const showThinking =
    props.aiStatus === 'submitted' &&
    props.messages.length > 0 &&
    props.messages[props.messages.length - 1].role === 'user';

  return (
    <Scroller ref={scrollerRef} $visible={initialScrollOccurred}>
      <div ref={contentRef}>
        {props.messages.map(renderMessage)}
        {showThinking && (
          <ThinkingContainer>
            <Spinner />
          </ThinkingContainer>
        )}
      </div>
      <div ref={spacerRef} />
    </Scroller>
  );
};
