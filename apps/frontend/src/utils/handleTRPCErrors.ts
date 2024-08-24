import { UseIonToastResult } from '@ionic/react';
import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '@feynote/trpc';
import { t } from 'i18next';

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

export const handleGenericError = (
  message: string,
  _presentToast: UseIonToastResult[0],
) => {
  presentToast(_presentToast, message);
  return;
};

export const handleTRPCErrors = (
  error: unknown,
  _presentToast: UseIonToastResult[0],
  handlerMap?: Record<number, string | (() => void)>,
) => {
  console.log(error);

  let errorCode = 500;
  if (error instanceof TRPCClientError) {
    errorCode =
      (error as TRPCClientError<AppRouter>).data?.httpStatus || errorCode;
  }
  const handler = handlerMap?.[errorCode];
  if (typeof handler === 'string') {
    presentToast(_presentToast, handler);
    return errorCode;
  }
  if (typeof handler === 'function') {
    handler();
    return errorCode;
  }

  if (errorCode === 401) {
    // TODO: convert this handler into a custom hook so that we can use session context and invalidate session here
  }

  const defaultErrorMessages = {
    // TODO: use hooks for these rather than global import
    0: t('generic.connectionError'),
    500: t('generic.error'),
  } as Record<number, string>;

  if (defaultErrorMessages[errorCode]) {
    presentToast(_presentToast, defaultErrorMessages[errorCode]);
    return errorCode;
  }

  presentToast(_presentToast, defaultErrorMessages[500]);

  return errorCode;
};
