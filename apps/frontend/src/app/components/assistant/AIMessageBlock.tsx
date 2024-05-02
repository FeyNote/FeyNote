import { IonIcon, IonLabel } from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const MessageSegment = styled.div`
  width: 100%;
  display: flex;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  max-width: 40rem;
  line-height: 1.5rem;
`;

const UserIcon = styled(IonIcon)`
  display: flex;
  align-items: flex-end;
  font-size: 24px;
  min-width: 24px;
  padding-right: 0.75rem;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const MessageHeader = styled(IonLabel)`
  font-weight: 500;
`;

interface Props {
  messageBlock: ChatCompletionMessageParam[];
  id: string;
}

export const AIMessageBlock = (props: Props) => {
  const { t } = useTranslation();

  const name =
    props.messageBlock[0].role === 'user'
      ? t('assistant.chat.assistant.name')
      : t('assistant.chat.user.name');

  const jsxMessageBlock = useMemo(() => {
    return props.messageBlock.map((message, idx) => {
      const key = props.id + 'bubble' + idx;
      if (typeof message.content !== 'string') return null;
      return <IonLabel key={key}>{message.content}</IonLabel>;
    });
  }, [props.messageBlock, props.id]);

  return (
    <MessageSegment>
      <UserIcon icon={personCircle} />
      <ContentContainer>
        <MessageHeader>{name}</MessageHeader>
        {jsxMessageBlock}
      </ContentContainer>
    </MessageSegment>
  );
};
