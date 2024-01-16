import { UseIonToastResult } from '@ionic/react';

const presentToast = (_presentToast: UseIonToastResult[0], message: string) => {
  _presentToast({
    message,
    color: 'danger',
    buttons: [
      {
        text: 'Dismiss',
        role: 'cancel',
      },
    ],
  });
};

export const handleTRPCErrors = (
  errorCode: number = 500,
  _presentToast: UseIonToastResult[0],
  handlerMap?: Record<number, string | (() => void)>
) => {
  const handler = handlerMap?.[errorCode];
  if (typeof handler === 'string') {
    presentToast(_presentToast, handler);
    return;
  }
  if (typeof handler === 'function') {
    handler();
    return;
  }

  const defaultErrorMessages = {
    0: 'A network connectivity error occurred',
    500: 'Oops, something went wrong, please try again.',
  } as Record<number, string>;

  if (defaultErrorMessages[errorCode]) {
    presentToast(_presentToast, defaultErrorMessages[errorCode]);
    return;
  }

  presentToast(_presentToast, defaultErrorMessages[500]);
};
