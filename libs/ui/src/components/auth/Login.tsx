import {
  IonButton,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonInput,
  IonItem,
  IonPage,
  useIonToast,
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
import { handleTRPCErrors } from '../../utils/handleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { ToggleAuthTypeButton } from './ToggleAuthTypeButton';
import { LogoActionContainer } from '../sharedComponents/LogoActionContainer';

interface Props {
  setAuthType: (authType: 'register' | 'login') => void;
}

export const Login: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailIsTouched, setEmailIsTouched] = useState(false);
  const [passwordIsTouched, setPasswordIsTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        handleTRPCErrors(error, presentToast, {
          400: 'The email or password you submited is incorrect.',
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
                label={t('auth.login.field.email.label')}
                type="email"
                labelPlacement="stacked"
                placeholder={t('auth.login.field.email.placeholder')}
                value={email}
                disabled={isLoading}
                errorText={t('auth.login.field.email.error')}
                onIonInput={(e) => emailInputHandler(e.target.value as string)}
                onIonBlur={() => setEmailIsTouched(false)}
              />
              <IonInput
                className={getIonInputClassNames(true, passwordIsTouched)}
                label={t('auth.login.field.password.label')}
                type="password"
                labelPlacement="stacked"
                placeholder={t('auth.login.field.password.placeholder')}
                errorText={t('auth.login.field.password.error')}
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
                {t('auth.login.button.login')}
              </IonButton>
              <IonButton fill="clear">
                {t('auth.login.button.forgot')}
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
