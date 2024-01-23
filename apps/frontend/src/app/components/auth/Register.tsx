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
import { Routes } from '../../routes';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';

export const Register: React.FC = () => {
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
        router.push(Routes.Dashboard);
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
          <IonTitle>Register</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <CenteredIonCard>
          <CenteredIonCardHeader>
            <IonCardTitle>Welcome!</IonCardTitle>
            <IonCardSubtitle>Your dungeon awaits you...</IonCardSubtitle>
          </CenteredIonCardHeader>
          <IonCardContent>
            <CenteredIonInputContainer>
              <IonItem>
                <IonInput
                  className={getIonInputClassNames(
                    emailIsValid,
                    emailIsTouched
                  )}
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
                  className={getIonInputClassNames(
                    passwordIsValid,
                    passwordIsTouched
                  )}
                  label="Password"
                  type="password"
                  labelPlacement="stacked"
                  placeholder="Enter a password"
                  errorText="Passwords must be greater than 8 characters long"
                  value={password}
                  disabled={isLoading}
                  onIonInput={(e) =>
                    passwordInputHandler(e.target.value as string)
                  }
                  onIonBlur={() => setPasswordIsTouched(false)}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  className={getIonInputClassNames(
                    confirmPasswordIsValid,
                    confirmPasswordIsTouched
                  )}
                  label="Confirm Password"
                  type="password"
                  labelPlacement="stacked"
                  placeholder="Confirm your password"
                  errorText="Passwords must match"
                  disabled={isLoading}
                  value={confirmPassword}
                  onKeyDown={enterKeyHandler}
                  onIonInput={(e) =>
                    confirmPasswordInputHandler(e.target.value as string)
                  }
                  onIonBlur={() => setConfirmPasswordIsTouched(false)}
                />
              </IonItem>
            </CenteredIonInputContainer>
            <br />
            <CenteredContainer>
              <IonButton
                onClick={submitRegister}
                disabled={disableRegisterButton}
              >
                Register
              </IonButton>
            </CenteredContainer>
            <SignInWithGoogleButton />
            <IonItem lines="none">
              <CenteredIonText>
                <sub>
                  Already have an account?{' '}
                  <IonRouterLink routerLink={Routes.Login}>
                    Login here!
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
