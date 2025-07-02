import {
  IonButton,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonInput,
  IonPage,
  useIonAlert,
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
import { validatePassword } from '@feynote/shared-utils';
import { appIdbStorageManager } from '../../utils/AppIdbStorageManager';

interface Props {
  redirectPath: string;
  authResetToken: string;
}

export const ResetPassword: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordIsTouched, setPasswordIsTouched] = useState(false);
  const [confirmPasswordIsTouched, setConfirmPasswordIsTouched] =
    useState(false);
  const [passwordIsValid, setPasswordIsValid] = useState(true);
  const [confirmPasswordIsValid, setConfirmPasswordIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [presentAlert] = useIonAlert();

  const submitReset = () => {
    if (!passwordIsValid || !confirmPasswordIsValid) {
      return;
    }

    setIsLoading(true);
    trpc.user.resetPassword
      .mutate({
        authResetToken: props.authResetToken,
        password,
      })
      .then(async () => {
        try {
          await appIdbStorageManager.removeSession();
        } catch (e) {
          console.error(e);
          Sentry.captureException(e);
        }

        await presentAlert({
          header: t('auth.resetPassword.success.header'),
          message: t('auth.resetPassword.success.message'),
          buttons: [t('generic.okay')],
          onDidDismiss: () => {
            window.location.href = props.redirectPath;
          },
        });
      })
      .catch((error) => {
        handleTRPCErrors(error, {
          403: () => {
            presentAlert({
              header: t('auth.resetPassword.expired.header'),
              message: t('auth.resetPassword.expired.message'),
              buttons: [t('generic.okay')],
              onDidDismiss: () => {
                window.location.href = props.redirectPath;
              },
            });
          },
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const passwordInputHandler = (value: string) => {
    const isValid = validatePassword(value);
    setPasswordIsValid(isValid);
    setPasswordIsTouched(true);
    setPassword(value);
    setConfirmPasswordIsValid(confirmPassword === value);
    setConfirmPasswordIsTouched(!!confirmPassword.length);
  };

  const confirmPasswordInputHandler = (value: string) => {
    const isValid = value === password;
    setConfirmPasswordIsValid(isValid);
    setConfirmPasswordIsTouched(true);
    setConfirmPassword(value);
  };

  const disableSubmitButton =
    isLoading || !passwordIsValid || !confirmPasswordIsValid;

  return (
    <IonPage>
      <IonContentFantasyBackground>
        <LogoActionContainer />
        <CenteredIonCard>
          <CenteredIonCardHeader>
            <IonCardTitle>{t('auth.resetPassword.title')}</IonCardTitle>
            <IonCardSubtitle>
              {t('auth.resetPassword.subtitle')}
            </IonCardSubtitle>
          </CenteredIonCardHeader>
          <IonCardContent>
            <CenteredIonInputContainer>
              <IonInput
                className={getIonInputClassNames(
                  passwordIsValid,
                  passwordIsTouched,
                )}
                label={t('auth.resetPassword.password.label')}
                type="password"
                labelPlacement="stacked"
                placeholder={t('auth.resetPassword.password.placeholder')}
                errorText={t('auth.resetPassword.password.error')}
                value={password}
                disabled={isLoading}
                onIonInput={(e) =>
                  passwordInputHandler(e.target.value as string)
                }
                onIonBlur={() => setPasswordIsTouched(false)}
              />
              <IonInput
                className={getIonInputClassNames(
                  confirmPasswordIsValid,
                  confirmPasswordIsTouched,
                )}
                label={t('auth.resetPassword.confirmPassword.label')}
                type="password"
                labelPlacement="stacked"
                placeholder={t(
                  'auth.resetPassword.confirmPassword.placeholder',
                )}
                errorText={t('auth.resetPassword.confirmPassword.error')}
                value={confirmPassword}
                disabled={isLoading}
                onIonInput={(e) =>
                  confirmPasswordInputHandler(e.target.value as string)
                }
                onIonBlur={() => setConfirmPasswordIsTouched(false)}
              />
            </CenteredIonInputContainer>
            <br />
            <CenteredContainer>
              <IonButton onClick={submitReset} disabled={disableSubmitButton}>
                {t('auth.resetPassword.submit')}
              </IonButton>
            </CenteredContainer>
          </IonCardContent>
        </CenteredIonCard>
      </IonContentFantasyBackground>
    </IonPage>
  );
};
