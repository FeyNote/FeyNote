import {
  IonButton,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonInput,
  IonPage,
} from '@ionic/react';
import * as Sentry from '@sentry/react';
import {
  CenteredContainer,
  CenteredIonCard,
  CenteredIonCardHeader,
  CenteredIonInputContainer,
  IonContentFantasyBackground,
} from './styles';
import { trpc } from '../../utils/trpc';
import { useState } from 'react';
import { getIonInputClassNames } from './input';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { LogoActionContainer } from '../sharedComponents/LogoActionContainer';
import { validateEmail } from '@feynote/shared-utils';
import { appIdbStorageManager } from '../../utils/localDb/AppIdbStorageManager';
import { useAlertContext } from '../../context/alert/AlertContext';

interface Props {
  redirectPath: string;
  authResetToken: string;
}

export const ResetEmail: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailIsTouched, setEmailIsTouched] = useState(false);
  const [confirmEmailIsTouched, setConfirmEmailIsTouched] = useState(false);
  const [emailIsValid, setEmailIsValid] = useState(true);
  const [confirmEmailIsValid, setConfirmEmailIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { showAlert } = useAlertContext();

  const _submitReset = () => {
    if (!emailIsValid || !confirmEmailIsValid) {
      return;
    }

    setIsLoading(true);
    trpc.user.resetEmail
      .mutate({
        authResetToken: props.authResetToken,
        email,
      })
      .then(async () => {
        try {
          await appIdbStorageManager.removeSession();
        } catch (e) {
          console.error(e);
          Sentry.captureException(e);
        }

        showAlert({
          title: t('auth.resetEmail.success.header'),
          children: t('auth.resetEmail.success.message'),
          actionButtons: [
            {
              title: t('generic.okay'),
              props: {
                onClick: () => {
                  window.location.href = props.redirectPath;
                },
              },
            },
          ],
        });
      })
      .catch((error) => {
        handleTRPCErrors(error, {
          403: () => {
            showAlert({
              title: t('auth.resetEmail.expired.header'),
              children: t('auth.resetEmail.expired.message'),
              actionButtons: [
                {
                  title: t('generic.okay'),
                  props: {
                    onClick: () => {
                      window.location.href = props.redirectPath;
                    },
                  },
                },
              ],
            });
          },
          409: () => {
            showAlert({
              title: t('auth.resetEmail.conflict.header'),
              children: t('auth.resetEmail.conflict.message'),
              actionButtons: [
                {
                  title: t('generic.okay'),
                },
              ],
            });
          },
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const submitReset = () => {
    if (!emailIsValid || !confirmEmailIsValid) {
      return;
    }

    showAlert({
      title: t('auth.resetEmail.confirm.header'),
      children: t('auth.resetEmail.confirm.message'),
      actionButtons: [
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
          },
        },
        {
          title: t('generic.confirm'),
          props: {
            role: 'confirm',
            onClick: () => {
              _submitReset();
            },
          },
        },
      ],
    });
  };

  const emailInputHandler = (value: string) => {
    const isValid = validateEmail(value);
    setEmailIsValid(isValid);
    setEmailIsTouched(true);
    setEmail(value);
    setConfirmEmailIsValid(confirmEmail === value);
    setConfirmEmailIsTouched(!!confirmEmail.length);
  };

  const confirmEmailInputHandler = (value: string) => {
    const isValid = value === email;
    setConfirmEmailIsValid(isValid);
    setConfirmEmailIsTouched(true);
    setConfirmEmail(value);
  };

  const disableSubmitButton =
    isLoading || !emailIsValid || !confirmEmailIsValid;

  return (
    <IonPage>
      <IonContentFantasyBackground>
        <LogoActionContainer />
        <CenteredIonCard>
          <CenteredIonCardHeader>
            <IonCardTitle>{t('auth.resetEmail.title')}</IonCardTitle>
            <IonCardSubtitle>{t('auth.resetEmail.subtitle')}</IonCardSubtitle>
          </CenteredIonCardHeader>
          <IonCardContent>
            <CenteredIonInputContainer>
              <IonInput
                className={getIonInputClassNames(emailIsValid, emailIsTouched)}
                label={t('auth.resetEmail.email.label')}
                type="email"
                labelPlacement="stacked"
                placeholder={t('auth.resetEmail.email.placeholder')}
                errorText={t('auth.resetEmail.email.error')}
                value={email}
                disabled={isLoading}
                onIonInput={(e) => emailInputHandler(e.target.value as string)}
                onIonBlur={() => setEmailIsTouched(false)}
              />
              <IonInput
                className={getIonInputClassNames(
                  confirmEmailIsValid,
                  confirmEmailIsTouched,
                )}
                label={t('auth.resetEmail.confirmEmail.label')}
                type="email"
                labelPlacement="stacked"
                placeholder={t('auth.resetEmail.confirmEmail.placeholder')}
                errorText={t('auth.resetEmail.confirmEmail.error')}
                value={confirmEmail}
                disabled={isLoading}
                onIonInput={(e) =>
                  confirmEmailInputHandler(e.target.value as string)
                }
                onIonBlur={() => setConfirmEmailIsTouched(false)}
              />
            </CenteredIonInputContainer>
            <br />
            <CenteredContainer>
              <IonButton onClick={submitReset} disabled={disableSubmitButton}>
                {t('auth.resetEmail.submit')}
              </IonButton>
            </CenteredContainer>
          </IonCardContent>
        </CenteredIonCard>
      </IonContentFantasyBackground>
    </IonPage>
  );
};
