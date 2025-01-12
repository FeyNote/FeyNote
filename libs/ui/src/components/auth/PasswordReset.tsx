import {
  IonButton,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonInput,
  IonPage,
  useIonAlert,
} from '@ionic/react';
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

interface Props {
  redirectPath: string;
  passwordResetToken: string;
}

export const PasswordReset: React.FC<Props> = (props) => {
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
    trpc.user.passwordReset
      .mutate({
        passwordResetToken: props.passwordResetToken,
        password,
      })
      .then(() => {
        presentAlert({
          header: t('auth.passwordReset.success.header'),
          message: t('auth.passwordReset.success.message'),
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
              header: t('auth.passwordReset.expired.header'),
              message: t('auth.passwordReset.expired.message'),
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
            <IonCardTitle>{t('auth.passwordReset.title')}</IonCardTitle>
            <IonCardSubtitle>
              {t('auth.passwordReset.subtitle')}
            </IonCardSubtitle>
          </CenteredIonCardHeader>
          <IonCardContent>
            <CenteredIonInputContainer>
              <IonInput
                className={getIonInputClassNames(
                  passwordIsValid,
                  passwordIsTouched,
                )}
                label={t('auth.passwordReset.password.label')}
                type="password"
                labelPlacement="stacked"
                placeholder={t('auth.passwordReset.password.placeholder')}
                errorText={t('auth.passwordReset.password.error')}
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
                label={t('auth.passwordReset.confirmPassword.label')}
                type="password"
                labelPlacement="stacked"
                placeholder={t(
                  'auth.passwordReset.confirmPassword.placeholder',
                )}
                errorText={t('auth.passwordReset.confirmPassword.error')}
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
                {t('auth.passwordReset.submit')}
              </IonButton>
            </CenteredContainer>
          </IonCardContent>
        </CenteredIonCard>
      </IonContentFantasyBackground>
    </IonPage>
  );
};
