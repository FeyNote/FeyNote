import {
  IonButton,
  IonButtons,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonMenuButton,
  IonPage,
  IonRouterLink,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
} from '@ionic/react';
import React, { useState, useContext } from 'react';
import {
  CenteredContainer,
  CenteredIonCard,
  CenteredIonCardHeader,
  CenteredIonInputContainer,
  CenteredIonText,
  SignInWithGoogleButton,
} from './styles';
import { validateEmail, validatePassword } from '@dnd-assistant/shared-utils';
import { getIonInputClassNames } from './input';
import { trpc } from '../../../utils/trpc';
import { SessionContext } from '../../context/session/SessionContext';
import { routes } from '../../routes';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useTranslation } from 'react-i18next';

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailIsTouched, setEmailIsTouched] = useState(false);
  const [passwordIsTouched, setPasswordIsTouched] = useState(false);
  const [confirmPasswordIsTouched, setConfirmPasswordIsTouched] =
    useState(false);
  const [emailIsValid, setEmailIsValid] = useState(true);
  const [passwordIsValid, setPasswordIsValid] = useState(true);
  const [confirmPasswordIsValid, setConfirmPasswordIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { setSession } = useContext(SessionContext);
  const router = useIonRouter();

  const submitRegister = () => {
    setIsLoading(true);
    trpc.user.register
      .mutate({
        email,
        password,
      })
      .then((_session) => {
        setSession(_session);
        router.push(routes.dashboard.build());
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast, {
          409: 'This user has already been registered.',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const emailInputHandler = (value: string) => {
    const isValid = validateEmail(value);
    setEmailIsValid(isValid);
    setEmailIsTouched(true);
    setEmail(value);
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

  const enterKeyHandler = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      submitRegister();
    }
  };

  const disableRegisterButton =
    isLoading || !emailIsValid || !passwordIsValid || !confirmPasswordIsValid;

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('auth.register.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <CenteredIonCard>
          <CenteredIonCardHeader>
            <IonCardTitle>{t('auth.register.card.title')}</IonCardTitle>
            <IonCardSubtitle>
              {t('auth.register.card.subtitle')}
            </IonCardSubtitle>
          </CenteredIonCardHeader>
          <IonCardContent>
            <CenteredIonInputContainer>
              <IonInput
                className={getIonInputClassNames(emailIsValid, emailIsTouched)}
                label={t('auth.register.field.email.label')}
                type="email"
                labelPlacement="stacked"
                placeholder={t('auth.register.field.email.placeholder')}
                value={email}
                disabled={isLoading}
                errorText={t('auth.register.field.email.error')}
                onIonInput={(e) => emailInputHandler(e.target.value as string)}
                onIonBlur={() => setEmailIsTouched(false)}
              />
              <IonInput
                className={getIonInputClassNames(
                  passwordIsValid,
                  passwordIsTouched
                )}
                label={t('auth.register.field.password.label')}
                type="password"
                labelPlacement="stacked"
                placeholder={t('auth.register.field.password.placeholder')}
                errorText={t('auth.register.field.password.error')}
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
                  confirmPasswordIsTouched
                )}
                label={t('auth.register.field.confirmPassword.label')}
                type="password"
                labelPlacement="stacked"
                placeholder={t(
                  'auth.register.field.confirmPassword.placeholder'
                )}
                errorText={t('auth.register.field.confirmPassword.error')}
                disabled={isLoading}
                value={confirmPassword}
                onKeyDown={enterKeyHandler}
                onIonInput={(e) =>
                  confirmPasswordInputHandler(e.target.value as string)
                }
                onIonBlur={() => setConfirmPasswordIsTouched(false)}
              />
            </CenteredIonInputContainer>
            <br />
            <CenteredContainer>
              <IonButton
                onClick={submitRegister}
                disabled={disableRegisterButton}
              >
                {t('auth.register.button.register')}
              </IonButton>
            </CenteredContainer>
            <SignInWithGoogleButton />
            <IonItem lines="none">
              <CenteredIonText>
                <sub>
                  {t('auth.register.subtext.text')}{' '}
                  <IonRouterLink routerLink={routes.login.build()}>
                    {t('auth.register.subtext.link')}
                  </IonRouterLink>
                </sub>
              </CenteredIonText>
            </IonItem>
          </IonCardContent>
        </CenteredIonCard>
      </IonContent>
    </IonPage>
  );
};
