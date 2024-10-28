import { useIonAlert } from '@ionic/react';
import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '@feynote/trpc';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { SessionContext } from '../context/session/SessionContext';
import { useSetAndPersistSession } from '../context/session/useSetAndPersistSession';

export const useHandleTRPCErrors = () => {
  const [presentAlert] = useIonAlert();
  const { t } = useTranslation();
  const { setSession } = useContext(SessionContext);
  const { setAndPersistSession: _setAndPersistSession } =
    useSetAndPersistSession();

  const handleTRPCErrors = (
    error: unknown,
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
      presentAlert({
        header: t('generic.error'),
        message: handler,
        buttons: [
          {
            text: t('generic.dismiss'),
            role: 'cancel',
          },
        ],
      });
      return errorCode;
    }
    if (typeof handler === 'function') {
      handler();
      return errorCode;
    }

    if (errorCode === 401) {
      if (setSession) {
        setSession(null);
      } else {
        // We fall back to _setAndPersistSession when this hook is used outside of the SessionContext
        _setAndPersistSession(null).finally(() => {
          window.location.reload();
        });
      }
      return;
    }

    const defaultErrorMessages = {
      0: t('generic.connectionError'),
      500: t('generic.error'),
    } as Record<number, string>;

    if (!defaultErrorMessages[errorCode]) {
      errorCode = 500;
    }

    presentAlert({
      header: t('generic.error'),
      message: defaultErrorMessages[errorCode],
      buttons: [
        {
          text: t('generic.dismiss'),
          role: 'cancel',
        },
      ],
    });
    return errorCode;
  };

  return {
    handleTRPCErrors,
  };
};
