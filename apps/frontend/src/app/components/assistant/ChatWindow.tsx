import { IonInput, IonTitle, useIonToast } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import { trpc } from '../../../utils/trpc';
import { Message, MessageRoles } from '@feynote/openai';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';

export const ChatWindow: React.FC = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [message, setMessage] = useState<Message>({
    content: '',
    role: MessageRoles.User,
  });
  const [messages, setMessages] = useState<Message[]>([]);

  const enterKeyHandler = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const sendMessage = () => {
    const newMessages = [...messages, message];
    trpc.chat.sendMessage
      .query({
        messages: newMessages,
      })
      .then((_session) => {
        setMessages(newMessages);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast, {
          400: 'The email or password you submited is incorrect.',
        });
      });
  };

  const messageInputHandler = (value: string) => {
    setMessage({
      content: value,
      role: MessageRoles.User,
    });
  };

  return (
    <>
      <IonInput
        label={t('assistant.chat.input')}
        type="password"
        labelPlacement="stacked"
        placeholder={t('assistant.chat.input.placeholder')}
        value={message.content}
        onKeyDown={enterKeyHandler}
        onIonInput={(e) => messageInputHandler(e.target.value as string)}
      />
    </>
  );
};
