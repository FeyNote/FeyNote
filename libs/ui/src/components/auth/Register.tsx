import { Button } from '@radix-ui/themes';
import { PaneContentContainer } from '../pane/PaneContentContainer';
import React, { useState } from 'react';
import {
  CenteredContainer,
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardSubtitle,
  AuthCardContent,
  AuthInputContainer,
  AuthCenteredText,
  IonContentFantasyBackground,
  SignInWithGoogleButton,
} from './styles';
import { validateEmail, validatePassword } from '@feynote/shared-utils';
import { AuthInput } from './AuthInput';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { ToggleAuthTypeButton } from './ToggleAuthTypeButton';
import { LogoActionContainer } from '../sharedComponents/LogoActionContainer';
import { createWelcomeArtifacts } from '../editor/tiptap/createWelcomeArtifacts';
import { useSessionContext } from '../../context/session/SessionContext';
import { welcomePendingSimpleref } from '../../utils/localDb/welcomePendingState';

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
  const [nameIsValid, setNameIsValid] = useState(false);
  const [emailIsValid, setEmailIsValid] = useState(false);
  const [passwordIsValid, setPasswordIsValid] = useState(false);
  const [confirmPasswordIsValid, setConfirmPasswordIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setSession } = useSessionContext();
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
        welcomePendingSimpleref.welcomePending = true;
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

  const enterKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    <PaneContentContainer>
      <IonContentFantasyBackground>
        <LogoActionContainer />
        <AuthCard>
          <AuthCardHeader>
            <AuthCardTitle>{t('auth.register.card.title')}</AuthCardTitle>
            <AuthCardSubtitle>
              {t('auth.register.card.subtitle')}
            </AuthCardSubtitle>
          </AuthCardHeader>
          <AuthCardContent>
            <AuthInputContainer>
              <AuthInput
                label={t('auth.register.name.label')}
                type="text"
                placeholder={t('auth.register.name.placeholder')}
                value={name}
                disabled={isLoading}
                errorText={t('auth.register.name.error')}
                isValid={nameIsValid}
                isTouched={nameIsTouched}
                onChange={nameInputHandler}
                onBlur={() => setNameIsTouched(false)}
              />
              <AuthInput
                label={t('auth.register.email.label')}
                type="email"
                placeholder={t('auth.register.email.placeholder')}
                value={email}
                disabled={isLoading}
                errorText={t('auth.register.email.error')}
                isValid={emailIsValid}
                isTouched={emailIsTouched}
                onChange={emailInputHandler}
                onBlur={() => setEmailIsTouched(false)}
              />
              <AuthInput
                label={t('auth.register.password.label')}
                type="password"
                placeholder={t('auth.register.password.placeholder')}
                errorText={t('auth.register.password.error')}
                value={password}
                disabled={isLoading}
                isValid={passwordIsValid}
                isTouched={passwordIsTouched}
                onChange={passwordInputHandler}
                onBlur={() => setPasswordIsTouched(false)}
              />
              <AuthInput
                label={t('auth.register.confirmPassword.label')}
                type="password"
                placeholder={t('auth.register.confirmPassword.placeholder')}
                errorText={t('auth.register.confirmPassword.error')}
                disabled={isLoading}
                value={confirmPassword}
                isValid={confirmPasswordIsValid}
                isTouched={confirmPasswordIsTouched}
                onChange={confirmPasswordInputHandler}
                onBlur={() => setConfirmPasswordIsTouched(false)}
                onKeyDown={enterKeyHandler}
              />
            </AuthInputContainer>
            <AuthCenteredText>
              <sub>
                <i>
                  {t('auth.tos.text')}{' '}
                  <a href="https://feynote.com/tos">{t('auth.tos.link')}</a>
                </i>
              </sub>
            </AuthCenteredText>
            <CenteredContainer>
              <Button onClick={submitRegister} disabled={disableRegisterButton}>
                {t('auth.register.submit')}
              </Button>
            </CenteredContainer>
            <SignInWithGoogleButton />
            <AuthCenteredText>
              <sub>
                <ToggleAuthTypeButton
                  onClick={() => props.setAuthType('login')}
                >
                  {t('auth.register.switchToLogin')}
                </ToggleAuthTypeButton>
              </sub>
            </AuthCenteredText>
          </AuthCardContent>
        </AuthCard>
      </IonContentFantasyBackground>
    </PaneContentContainer>
  );
};
