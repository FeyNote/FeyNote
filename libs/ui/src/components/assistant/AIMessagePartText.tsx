import React, { useMemo } from 'react';
import { starkdown } from 'starkdown';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { IonButton, IonButtons, IonIcon } from '@ionic/react';
import { copyOutline, refresh } from 'ionicons/icons';
import type { TextUIPart, ChatStatus } from 'ai';

interface Props {
  part: TextUIPart;
  messageId: string;
  aiStatus: ChatStatus;
  retryMessage: (messageId: string) => void;
}

export const AIMessagePartText = (props: Props) => {
  const part = props.part;
  if (part.type !== 'text') {
    throw new Error("Part must be of type 'text'");
  }

  const messageHTML = useMemo(() => {
    return starkdown(part.text);
  }, [part.text]);

  return (
    <React.Fragment>
      <div
        dangerouslySetInnerHTML={{
          __html: messageHTML,
        }}
      ></div>
      <IonButtons>
        <IonButton
          size="small"
          onClick={() =>
            copyToClipboard({
              html: messageHTML,
              plaintext: part.text,
            })
          }
        >
          <IonIcon icon={copyOutline} />
        </IonButton>
        <IonButton
          disabled={
            props.aiStatus === 'submitted' || props.aiStatus === 'streaming'
          }
          size="small"
          onClick={() => props.retryMessage(props.messageId)}
        >
          <IonIcon icon={refresh} />
        </IonButton>
      </IonButtons>
    </React.Fragment>
  );
};
