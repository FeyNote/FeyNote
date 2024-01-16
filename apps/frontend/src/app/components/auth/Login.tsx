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

export const Login: React.FC = () => {
  const [presentToast] = useIonToast();
  const loginMutation = trpc.user.login.useMutation({
    onError: (error) => {
      handleTRPCErrors(error.data?.httpStatus, presentToast, {
        400: 'The email or password you submited is incorrect.',
      });
    },
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailIsTouched, setEmailIsTouched] = useState(false);
  const [passwordIsTouched, setPasswordIsTouched] = useState(false);

  const { setSession } = useContext(SessionContext);
  const router = useIonRouter();

  const loginHook = () => {
    loginMutation.mutate({
      email,
      password,
    });
  };

  if (loginMutation.isSuccess) {
    setSession(loginMutation.data);
    router.push(Routes.Dashboard);
    return;
  }

  const emailInputHandler = (value: string) => {
    setEmailIsTouched(true);
    setEmail(value);
  };

  const passwordInputHandler = (value: string) => {
    setPasswordIsTouched(true);
    setPassword(value);
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
                  disabled={loginMutation.isLoading}
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
                  disabled={loginMutation.isLoading}
                  onIonInput={(e) =>
                    passwordInputHandler(e.target.value as string)
                  }
                  onIonBlur={() => setPasswordIsTouched(false)}
                />
              </IonItem>
            </CenteredIonInputContainer>
            <br />
            <CenteredContainer>
              <IonButton onClick={loginHook} disabled={loginMutation.isLoading}>
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
