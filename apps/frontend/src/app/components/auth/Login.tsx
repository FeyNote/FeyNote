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
import {
  CenteredContainer,
  CenteredIonCard,
  CenteredIonCardHeader,
  CenteredIonInputContainer,
  CenteredIonText,
  SignInWithGoogleButton,
} from './styles';
import { trpc } from '../../../utils/trpc';
import { useContext, useState } from 'react';
import { getIonInputClassNames } from './input';
import { SessionContext } from '../../context/session/SessionContext';
import { Routes } from '../../routes';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useTranslation } from 'react-i18next';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailIsTouched, setEmailIsTouched] = useState(false);
  const [passwordIsTouched, setPasswordIsTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setSession } = useContext(SessionContext);
  const router = useIonRouter();

  const submitLogin = () => {
    setIsLoading(true);
    trpc.user.login
      .mutate({
        email,
        password,
      })
      .then((_session) => {
        setSession(_session);
        router.push(Routes.Dashboard);
      })
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
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <CenteredIonCard>
          <CenteredIonCardHeader>
            <IonCardTitle>Welcome Back!</IonCardTitle>
            <IonCardSubtitle>Your dungeon awaits you...</IonCardSubtitle>
            {t('examplestr')}
          </CenteredIonCardHeader>
          <IonCardContent>
            <CenteredIonInputContainer>
              <IonItem>
                <IonInput
                  className={getIonInputClassNames(true, emailIsTouched)}
                  label="Email"
                  type="email"
                  labelPlacement="stacked"
                  placeholder="Enter your email"
                  value={email}
                  disabled={isLoading}
                  errorText="Must enter a valid email"
                  onIonInput={(e) =>
                    emailInputHandler(e.target.value as string)
                  }
                  onIonBlur={() => setEmailIsTouched(false)}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  className={getIonInputClassNames(true, passwordIsTouched)}
                  label="Password"
                  type="password"
                  labelPlacement="stacked"
                  placeholder="Enter a password"
                  errorText="Passwords must be greater than 8 characters long"
                  value={password}
                  disabled={isLoading}
                  onKeyDown={enterKeyHandler}
                  onIonInput={(e) =>
                    passwordInputHandler(e.target.value as string)
                  }
                  onIonBlur={() => setPasswordIsTouched(false)}
                />
              </IonItem>
            </CenteredIonInputContainer>
            <br />
            <CenteredContainer>
              <IonButton onClick={submitLogin} disabled={isLoading}>
                Login
              </IonButton>
              <IonButton fill="clear">Forgot</IonButton>
            </CenteredContainer>
            <SignInWithGoogleButton />
            <IonItem lines="none">
              <CenteredIonText>
                <sub>
                  To register for an account click{' '}
                  <IonRouterLink routerLink={Routes.Register}>
                    here!
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
