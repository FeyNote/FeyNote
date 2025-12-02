import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '@feynote/trpc';
import { useTranslation } from 'react-i18next';
import { useSessionContext } from '../context/session/SessionContext';
import { useSetAndPersistSession } from '../context/session/useSetAndPersistSession';
import * as Sentry from '@sentry/react';
import { isAxiosError } from 'axios';
import { useAlertContext } from '../context/alert/AlertContext';

const openAlertTracker = {
  isOpen: false,
};

const offlineErrorMsgs = [
  'NetworkError when attempting to fetch resource.',
  'Failed to fetch',
  'Load failed',
];

/**
 * Presents a user-facing message when capturing an error in hook-style.
 * This can also handle Axios errors, though we don't use Axios much.
 */
export const useHandleTRPCErrors = () => {
  const { showAlert } = useAlertContext();
  const { t } = useTranslation();
  const setSession = useSessionContext(true)?.setSession;
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
      // Offline Fetch requests don't give us a statuscode to go off of
      if (offlineErrorMsgs.includes(error.message)) {
        errorCode = 0;
      }
    }
    if (isAxiosError(error) && error.response) {
      errorCode = error.response.status;
    }
    const handler = handlerMap?.[errorCode];
    if (typeof handler === 'string') {
      if (openAlertTracker.isOpen) {
        return errorCode;
      }
      openAlertTracker.isOpen = true;
      showAlert({
        defaultOpen: true,
        title: t('generic.error'),
        description: handler,
        actionButtons: [
          {
            title: t('generic.okay'),
            props: {
              role: 'cancel',
            },
          },
        ],
        onOpenChange: (open) => {
          if (!open) openAlertTracker.isOpen = false;
        },
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
      500: t('error.500'),
    } as Record<number, string>;

    if (!defaultErrorMessages[errorCode]) {
      errorCode = 500;
    }

    if (openAlertTracker.isOpen) {
      return errorCode;
    }

    openAlertTracker.isOpen = true;
    showAlert({
      defaultOpen: true,
      title: t('generic.error'),
      description: defaultErrorMessages[errorCode],
      actionButtons: [
        {
          title: t('generic.okay'),
          props: {
            role: 'cancel',
          },
        },
      ],
      onOpenChange: (open) => {
        if (!open) openAlertTracker.isOpen = false;
      },
    });

    console.error('Unexpected TRPC error', error);
    Sentry.captureException(error);

    return errorCode;
  };

  return {
    handleTRPCErrors,
  };
};
