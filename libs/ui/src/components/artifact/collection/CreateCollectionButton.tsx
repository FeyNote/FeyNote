import { IonButton, IonIcon, IonModal } from '@ionic/react';
import { add } from 'ionicons/icons';
import { CreateCollectionModal } from './CreateCollectionModal';
import { useRef } from 'react';

export const CreateCollectionButton = () => {
  const modalRef = useRef<HTMLIonModalElement>(null);

  return (
    <>
      <IonButton id="createCollectionModalTrigger" size="small" fill="clear">
        <IonIcon slot="icon-only" icon={add} />
      </IonButton>
      <IonModal ref={modalRef} trigger="createCollectionModalTrigger">
        <CreateCollectionModal onDismiss={() => modalRef.current?.dismiss()} />
      </IonModal>
    </>
  );
};
