import { useRef, useState } from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { globe } from 'ionicons/icons';
import { OverlayEventDetail } from '@ionic/core/components';

export const ChatButton: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  const input = useRef<HTMLIonInputElement>(null);

  const [message, setMessage] = useState(
    'This modal example uses triggers to automatically open a modal when the button is clicked.'
  );

  function confirm() {
    modal.current?.dismiss(input.current?.value, 'confirm');
  }

  function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
    if (ev.detail.role === 'confirm') {
      setMessage(`Hello, ${ev.detail.data}!`);
    }
  }

  return (
    <IonButtons slot="primary">
      <IonButton id="chat-button-modal" expand="block">
        <IonIcon slot="icon-only" icon={globe}></IonIcon>
      </IonButton>
      <IonModal ref={modal} trigger="chat-button-modal" onWillDismiss={(ev) => onWillDismiss(ev)}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => modal.current?.dismiss()}>Close</IonButton>
            </IonButtons>
            <IonTitle>Welcome</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonInput
              label="Enter your name"
              labelPlacement="stacked"
              ref={input}
              type="text"
              placeholder="Your name"
            />
          </IonItem>
        </IonContent>
      </IonModal>
    </IonButtons>
  );
};
