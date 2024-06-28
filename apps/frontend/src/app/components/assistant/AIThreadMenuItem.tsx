import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { Thread } from '@prisma/client';
import { mail } from 'ionicons/icons';
import { routes } from '../../routes';

interface Props {
  thread: Thread;
}

export const AIThreadMenuItem = (props: Props) => {
  return (
    <IonItem
      button
      routerLink={routes.assistantChat.build({ id: props.thread.id })}
    >
      <IonIcon slot="start" icon={mail} />
      <IonLabel>
        {props.thread.title}
        <p>Default preview text</p>
      </IonLabel>
    </IonItem>
  );
};
