import { IonContent, useIonPopover } from '@ionic/react';
import { useRef, type ComponentProps, type FC } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useContextMenu = <T extends ComponentProps<U>, U extends FC<any>>(
  Component: U,
  props: T,
) => {
  const popoverDismissRef = useRef<() => void>(undefined);
  const popoverContents = (
    <IonContent onClick={popoverDismissRef.current}>
      <Component {...props} />
    </IonContent>
  );

  const [presentContextMenuPopover, dismissContextMenuPopover] = useIonPopover(
    popoverContents,
    {
      onDismiss: (data: unknown, role: string) =>
        dismissContextMenuPopover(data, role),
    },
  );
  popoverDismissRef.current = dismissContextMenuPopover;

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    presentContextMenuPopover({
      event: e.nativeEvent,
    });
  };

  return {
    onContextMenu,
    dismissContextMenuPopover,
  };
};
