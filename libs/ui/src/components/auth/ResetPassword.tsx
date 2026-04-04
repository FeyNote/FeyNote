import { Button } from '@radix-ui/themes';
import { PaneContentContainer } from '../pane/PaneContentContainer';
import * as Sentry from '@sentry/react';
import {
  CenteredContainer,
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardSubtitle,
  AuthCardContent,
  AuthInputContainer,
  IonContentFantasyBackground,
} from './styles';
import { trpc } from '../../utils/trpc';
import { useState } from 'react';
import { AuthInput } from './AuthInput';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { LogoActionContainer } from '../sharedComponents/LogoActionContainer';
import { validatePassword } from '@feynote/shared-utils';
import { appIdbStorageManager } from '../../utils/localDb/AppIdbStorageManager';
import { useAlertContext } from '../../context/alert/AlertContext';

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
  const { showAlert } = useAlertContext();

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

        showAlert({
          title: t('auth.resetPassword.success.header'),
          children: t('auth.resetPassword.success.message'),
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
              title: t('auth.resetPassword.expired.header'),
              children: t('auth.resetPassword.expired.message'),
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
    <PaneContentContainer>
      <IonContentFantasyBackground>
        <LogoActionContainer />
        <AuthCard>
          <AuthCardHeader>
            <AuthCardTitle>{t('auth.resetPassword.title')}</AuthCardTitle>
            <AuthCardSubtitle>
              {t('auth.resetPassword.subtitle')}
            </AuthCardSubtitle>
          </AuthCardHeader>
          <AuthCardContent>
            <AuthInputContainer>
              <AuthInput
                label={t('auth.resetPassword.password.label')}
                type="password"
                placeholder={t('auth.resetPassword.password.placeholder')}
                errorText={t('auth.resetPassword.password.error')}
                value={password}
                disabled={isLoading}
                isValid={passwordIsValid}
                isTouched={passwordIsTouched}
                onChange={passwordInputHandler}
                onBlur={() => setPasswordIsTouched(false)}
              />
              <AuthInput
                label={t('auth.resetPassword.confirmPassword.label')}
                type="password"
                placeholder={t(
                  'auth.resetPassword.confirmPassword.placeholder',
                )}
                errorText={t('auth.resetPassword.confirmPassword.error')}
                value={confirmPassword}
                disabled={isLoading}
                isValid={confirmPasswordIsValid}
                isTouched={confirmPasswordIsTouched}
                onChange={confirmPasswordInputHandler}
                onBlur={() => setConfirmPasswordIsTouched(false)}
              />
            </AuthInputContainer>
            <br />
            <CenteredContainer>
              <Button onClick={submitReset} disabled={disableSubmitButton}>
                {t('auth.resetPassword.submit')}
              </Button>
            </CenteredContainer>
          </AuthCardContent>
        </AuthCard>
      </IonContentFantasyBackground>
    </PaneContentContainer>
  );
};
