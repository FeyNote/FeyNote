import {
  IonButton,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonInput,
  IonItem,
  IonPage,
  useIonAlert,
} from '@ionic/react';
import {
  CenteredContainer,
  CenteredIonCard,
  CenteredIonCardHeader,
  CenteredIonInputContainer,
  CenteredIonText,
  IonContentFantasyBackground,
  SignInWithGoogleButton,
} from './styles';
import { trpc } from '../../utils/trpc';
import { useContext, useState } from 'react';
import { getIonInputClassNames } from './input';
import { SessionContext } from '../../context/session/SessionContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { ToggleAuthTypeButton } from './ToggleAuthTypeButton';
import { LogoActionContainer } from '../sharedComponents/LogoActionContainer';

interface Props {
  setAuthType: (authType: 'register' | 'login') => void;
}

export const Login: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailIsTouched, setEmailIsTouched] = useState(false);
  const [passwordIsTouched, setPasswordIsTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [presentAlert] = useIonAlert();

  const { setSession } = useContext(SessionContext);

  const submitLogin = () => {
    setIsLoading(true);
    trpc.user.login
      .mutate({
        email,
        password,
      })
      .then((_session) => setSession(_session))
      .catch((error) => {
        handleTRPCErrors(error, {
          412: t('auth.login.error.passwordNotSet'),
          404: t('auth.login.error.notFound'),
          403: t('auth.login.error.invalidPassword'),
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const submitTriggerReset = () => {
    if (!email) {
      presentAlert({
        header: t('auth.login.forgot.noEmail'),
        buttons: [t('generic.okay')],
      });
      return;
    }

    setIsLoading(true);
    trpc.user.triggerPasswordReset
      .mutate({
        email,
        returnUrl: window.location.origin,
      })
      .then((_session) => {
        presentAlert({
          header: t('auth.login.forgot.submitted.header'),
          message: t('auth.login.forgot.submitted.message'),
          buttons: [t('generic.okay')],
        });
      })
      .catch((error) => {
        handleTRPCErrors(error, {
          404: () => {
            presentAlert({
              header: t('auth.login.forgot.notFound.header'),
              message: t('auth.login.forgot.notFound.message'),
              buttons: [t('generic.okay')],
            });
          },
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const emailInputHandler = (value: string) => {
    setEmailIsTouched(true);
    setEmail(value);
  };

  const passwordInputHandler = (value: string) => {
    setPasswordIsTouched(true);
    setPassword(value);
  };

  const enterKeyHandler = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      submitLogin();
    }
  };

  return (
    <IonPage>
      <IonContentFantasyBackground>
        <LogoActionContainer />
        <CenteredIonCard>
          <CenteredIonCardHeader>
            <IonCardTitle>{t('auth.login.card.title')}</IonCardTitle>
            <IonCardSubtitle>{t('auth.login.card.subtitle')}</IonCardSubtitle>
          </CenteredIonCardHeader>
          <IonCardContent>
            <CenteredIonInputContainer>
              <IonInput
                className={getIonInputClassNames(true, emailIsTouched)}
                label={t('auth.login.email.label')}
                type="email"
                labelPlacement="stacked"
                placeholder={t('auth.login.email.placeholder')}
                value={email}
                disabled={isLoading}
                errorText={t('auth.login.email.error')}
                onIonInput={(e) => emailInputHandler(e.target.value as string)}
                onIonBlur={() => setEmailIsTouched(false)}
              />
              <IonInput
                className={getIonInputClassNames(true, passwordIsTouched)}
                label={t('auth.login.password.label')}
                type="password"
                labelPlacement="stacked"
                placeholder={t('auth.login.password.placeholder')}
                errorText={t('auth.login.password.error')}
                value={password}
                disabled={isLoading}
                onKeyDown={enterKeyHandler}
                onIonInput={(e) =>
                  passwordInputHandler(e.target.value as string)
                }
                onIonBlur={() => setPasswordIsTouched(false)}
              />
            </CenteredIonInputContainer>
            <br />
            <CenteredContainer>
              <IonButton onClick={submitLogin} disabled={isLoading}>
                {t('auth.login.submit')}
              </IonButton>
              <IonButton onClick={submitTriggerReset} fill="clear">
                {t('auth.login.forgot')}
              </IonButton>
            </CenteredContainer>
            <SignInWithGoogleButton />
            <IonItem lines="none">
              <CenteredIonText>
                <sub>
                  <ToggleAuthTypeButton
                    onClick={() => props.setAuthType('register')}
                  >
                    {t('auth.login.switchToRegister')}
                  </ToggleAuthTypeButton>
                </sub>
              </CenteredIonText>
            </IonItem>
          </IonCardContent>
        </CenteredIonCard>
      </IonContentFantasyBackground>
    </IonPage>
  );
};
