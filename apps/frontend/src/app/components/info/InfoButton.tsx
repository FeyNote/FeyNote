import { IonButton, IonContent, IonIcon, useIonPopover } from '@ionic/react';
import { informationCircle } from 'ionicons/icons';

const buildInfoPopover = (message: string) => {
  return () => <IonContent className="ion-padding">{message}</IonContent>;
};

interface Props {
  slot?: string;
  message: string;
}

export const InfoButton = (props: Props) => {
  const [present, dismiss] = useIonPopover(buildInfoPopover(props.message), {
    onDismiss: (data: unknown, role: string) => dismiss(data, role),
  });

  return (
    <IonButton
      size="small"
      slot={props.slot}
      fill="clear"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={(event: any) => present({ event })}
    >
      <IonIcon slot="icon-only" icon={informationCircle} />
    </IonButton>
  );
};
