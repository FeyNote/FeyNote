import {
  IonButton,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonInput,
  IonItem,
  IonPage,
} from '@ionic/react';
import React, { useState, useContext } from 'react';
import {
  CenteredContainer,
  CenteredIonCard,
  CenteredIonCardHeader,
  CenteredIonInputContainer,
  CenteredIonText,
  IonContentFantasyBackground,
  SignInWithGoogleButton,
} from './styles';
import { validateEmail, validatePassword } from '@feynote/shared-utils';
import { getIonInputClassNames } from './input';
import { trpc } from '../../utils/trpc';
import { SessionContext } from '../../context/session/SessionContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { ToggleAuthTypeButton } from './ToggleAuthTypeButton';
import { LogoActionContainer } from '../sharedComponents/LogoActionContainer';
import { createWelcomeArtifacts } from '../editor/tiptap/createWelcomeArtifacts';
import { setWelcomeModalPending } from '../../utils/welcomeModalState';

interface Props {
  setAuthType: (authType: 'register' | 'login') => void;
}

export const Register: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameIsTouched, setNameIsTouched] = useState(false);
  const [emailIsTouched, setEmailIsTouched] = useState(false);
  const [passwordIsTouched, setPasswordIsTouched] = useState(false);
  const [confirmPasswordIsTouched, setConfirmPasswordIsTouched] =
    useState(false);
  const [nameIsValid, setNameIsValid] = useState(true);
  const [emailIsValid, setEmailIsValid] = useState(true);
  const [passwordIsValid, setPasswordIsValid] = useState(true);
  const [confirmPasswordIsValid, setConfirmPasswordIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { setSession } = useContext(SessionContext);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const submitRegister = () => {
    setIsLoading(true);
    trpc.user.register
      .mutate({
        name,
        email,
        password,
      })
      .then((_session) => {
        setWelcomeModalPending(true);
        setSession(_session).then(() => {
          createWelcomeArtifacts();
        });
      })
      .catch((error) => {
        handleTRPCErrors(error, {
          409: t('auth.register.conflict'),
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const nameInputHandler = (value: string) => {
    const isValid = value.length > 0;
    setNameIsValid(isValid);
    setNameIsTouched(true);
    setName(value);
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
    isLoading ||
    !nameIsValid ||
    !emailIsValid ||
    !passwordIsValid ||
    !confirmPasswordIsValid;

  return (
    <IonPage>
      <IonContentFantasyBackground>
        <LogoActionContainer />
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
                className={getIonInputClassNames(nameIsValid, nameIsTouched)}
                label={t('auth.register.name.label')}
                type="text"
                labelPlacement="stacked"
                placeholder={t('auth.register.name.placeholder')}
                value={name}
                disabled={isLoading}
                errorText={t('auth.register.name.error')}
                onIonInput={(e) => nameInputHandler(e.target.value as string)}
                onIonBlur={() => setNameIsTouched(false)}
              />
              <IonInput
                className={getIonInputClassNames(emailIsValid, emailIsTouched)}
                label={t('auth.register.email.label')}
                type="email"
                labelPlacement="stacked"
                placeholder={t('auth.register.email.placeholder')}
                value={email}
                disabled={isLoading}
                errorText={t('auth.register.email.error')}
                onIonInput={(e) => emailInputHandler(e.target.value as string)}
                onIonBlur={() => setEmailIsTouched(false)}
              />
              <IonInput
                className={getIonInputClassNames(
                  passwordIsValid,
                  passwordIsTouched,
                )}
                label={t('auth.register.password.label')}
                type="password"
                labelPlacement="stacked"
                placeholder={t('auth.register.password.placeholder')}
                errorText={t('auth.register.password.error')}
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
                label={t('auth.register.confirmPassword.label')}
                type="password"
                labelPlacement="stacked"
                placeholder={t('auth.register.confirmPassword.placeholder')}
                errorText={t('auth.register.confirmPassword.error')}
                disabled={isLoading}
                value={confirmPassword}
                onKeyDown={enterKeyHandler}
                onIonInput={(e) =>
                  confirmPasswordInputHandler(e.target.value as string)
                }
                onIonBlur={() => setConfirmPasswordIsTouched(false)}
              />
            </CenteredIonInputContainer>
            <IonItem lines="none">
              <CenteredIonText>
                <sub>
                  <i>
                    {t('auth.tos.text')}{' '}
                    <a href="https://feynote.com/tos">{t('auth.tos.link')}</a>
                  </i>
                </sub>
              </CenteredIonText>
            </IonItem>
            <CenteredContainer>
              <IonButton
                onClick={submitRegister}
                disabled={disableRegisterButton}
              >
                {t('auth.register.submit')}
              </IonButton>
            </CenteredContainer>
            <SignInWithGoogleButton />
            <IonItem lines="none">
              <CenteredIonText>
                <sub>
                  <ToggleAuthTypeButton
                    onClick={() => props.setAuthType('login')}
                  >
                    {t('auth.register.switchToLogin')}
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
