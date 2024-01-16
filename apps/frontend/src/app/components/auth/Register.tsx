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
import React, { useState, useCallback, useContext } from 'react';
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
  const registerMutation = trpc.user.register.useMutation({
    onError: (error) => {
      handleTRPCErrors(error.data?.httpStatus, presentToast, {
        409: 'This user has already been registered.',
      });
    },
  });
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
  const { setSession } = useContext(SessionContext);
  const router = useIonRouter();

  const registerHook = useCallback(() => {
    registerMutation.mutate({
      email,
      password,
    });
  }, [email, password, registerMutation]);

  if (registerMutation.isSuccess) {
    setSession(registerMutation.data);
    router.push(Routes.Dashboard);
    return;
  }

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

  const disableRegisterButton =
    registerMutation.isLoading ||
    !emailIsValid ||
    !passwordIsValid ||
    !confirmPasswordIsValid;

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
                  disabled={registerMutation.isLoading}
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
                  disabled={registerMutation.isLoading}
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
                  disabled={registerMutation.isLoading}
                  value={confirmPassword}
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
                onClick={registerHook}
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
