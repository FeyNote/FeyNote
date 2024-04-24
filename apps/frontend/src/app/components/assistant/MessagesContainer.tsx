import { IonContent } from '@ionic/react';
import { Message } from '@feynote/shared-utils';

interface Props {
  messages: Message[];
}

export const MessagesContainer = (props: Props) => {
  return <IonContent>{JSON.stringify(props.messages)}</IonContent>;
};
