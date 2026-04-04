import { Button } from '@radix-ui/themes';
import { PaneContentContainer } from '../pane/PaneContentContainer';
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
import { trpc } from '../../utils/trpc';
import { useState } from 'react';
import { AuthInput } from './AuthInput';
import { useSessionContext } from '../../context/session/SessionContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { ToggleAuthTypeButton } from './ToggleAuthTypeButton';
import { LogoActionContainer } from '../sharedComponents/LogoActionContainer';
import { ActionDialog } from '../sharedComponents/ActionDialog';

interface Props {
  setAuthType: (authType: 'register' | 'login') => void;
}

interface DialogState {
  open: boolean;
  title: string;
  description?: string;
}

export const Login: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailIsTouched, setEmailIsTouched] = useState(false);
  const [passwordIsTouched, setPasswordIsTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    title: '',
  });

  const { setSession } = useSessionContext();

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
      setDialog({
        open: true,
        title: t('auth.login.forgot.noEmail.header'),
        description: t('auth.login.forgot.noEmail'),
      });
      return;
    }

    setIsLoading(true);
    trpc.user.triggerResetPassword
      .mutate({
        email,
        returnUrl: window.location.origin,
      })
      .then(() => {
        setDialog({
          open: true,
          title: t('auth.login.forgot.submitted.header'),
          description: t('auth.login.forgot.submitted.message'),
        });
      })
      .catch((error) => {
        handleTRPCErrors(error, {
          404: () => {
            setDialog({
              open: true,
              title: t('auth.login.forgot.notFound.header'),
              description: t('auth.login.forgot.notFound.message'),
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

  const enterKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitLogin();
    }
  };

  return (
    <PaneContentContainer>
      <IonContentFantasyBackground>
        <LogoActionContainer />
        <AuthCard>
          <AuthCardHeader>
            <AuthCardTitle>{t('auth.login.card.title')}</AuthCardTitle>
            <AuthCardSubtitle>{t('auth.login.card.subtitle')}</AuthCardSubtitle>
          </AuthCardHeader>
          <AuthCardContent>
            <AuthInputContainer>
              <AuthInput
                label={t('auth.login.email.label')}
                type="email"
                placeholder={t('auth.login.email.placeholder')}
                value={email}
                disabled={isLoading}
                errorText={t('auth.login.email.error')}
                isValid={true}
                isTouched={emailIsTouched}
                onChange={emailInputHandler}
                onBlur={() => setEmailIsTouched(false)}
              />
              <AuthInput
                label={t('auth.login.password.label')}
                type="password"
                placeholder={t('auth.login.password.placeholder')}
                errorText={t('auth.login.password.error')}
                value={password}
                disabled={isLoading}
                isValid={true}
                isTouched={passwordIsTouched}
                onChange={passwordInputHandler}
                onBlur={() => setPasswordIsTouched(false)}
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
              <Button onClick={submitLogin} disabled={isLoading}>
                {t('auth.login.submit')}
              </Button>
              <Button
                onClick={submitTriggerReset}
                variant="ghost"
                style={{ margin: '0' }}
              >
                {t('auth.login.forgot')}
              </Button>
            </CenteredContainer>
            <SignInWithGoogleButton />
            <AuthCenteredText>
              <sub>
                <ToggleAuthTypeButton
                  onClick={() => props.setAuthType('register')}
                >
                  {t('auth.login.switchToRegister')}
                </ToggleAuthTypeButton>
              </sub>
            </AuthCenteredText>
          </AuthCardContent>
        </AuthCard>
      </IonContentFantasyBackground>
      <ActionDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        title={dialog.title}
        description={dialog.description}
        actionButtons="okay"
      />
    </PaneContentContainer>
  );
};
