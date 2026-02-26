import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { trpc } from '../../utils/trpc';
import { useSessionContext } from '../../context/session/SessionContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { createWelcomeArtifacts } from '../editor/tiptap/createWelcomeArtifacts';
import { welcomePendingSimpleref } from '../../utils/localDb/welcomePendingState';
import { getElectronAPI } from '../../utils/electronAPI';
import { getIsElectron } from '../../utils/getIsElectron';

export interface SignInWithGoogleProps {
  className?: string;
}

const getGoogleRef = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).google;
};

const SignInWithGoogleWeb: React.FC<SignInWithGoogleProps> = (props) => {
  const { setSession } = useSessionContext();
  const buttonRef = useRef<HTMLDivElement>(undefined);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const triggerGoogleButtonRender = useCallback(() => {
    if (getGoogleRef() && buttonRef.current) {
      getGoogleRef().accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'filled_black',
        text: 'continue_with',
        size: 'large',
        logo_alignment: 'left',
      });
    }
  }, []);

  const signInWithGoogle = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: any) => {
      trpc.user.signInWithGoogle
        .mutate(args)
        .then((response) => {
          if (response.created) {
            welcomePendingSimpleref.welcomePending = true;
          }
          setSession(response.session).then(() => {
            if (response.created) {
              createWelcomeArtifacts();
            }
          });
        })
        .catch((error) => {
          handleTRPCErrors(error);
        });
    },
    [setSession],
  );

  const buttonRefHook = useCallback(
    (node: HTMLDivElement) => {
      buttonRef.current = node;
      triggerGoogleButtonRender();
    },
    [triggerGoogleButtonRender],
  );

  const googleSignInBtnOnLoadHook = useCallback(() => {
    getGoogleRef()?.accounts.id.initialize({
      client_id:
        '458922288770-fig3hth6vu4ujhlg9slhsmbcrv2atug6.apps.googleusercontent.com',
      context: 'signin',
      ux_mode: 'popup',
      callback: signInWithGoogle,
      auto_prompt: 'false',
    });
    triggerGoogleButtonRender();
  }, [signInWithGoogle, triggerGoogleButtonRender]);

  useEffect(() => {
    const googleScriptNodeId = 'google-auth-script';
    const existingNode = document.getElementById(googleScriptNodeId);
    if (!existingNode) {
      const googleScriptNode = document.createElement('script');
      googleScriptNode.src = 'https://accounts.google.com/gsi/client';
      googleScriptNode.async = true;
      googleScriptNode.id = googleScriptNodeId;
      googleScriptNode.addEventListener('load', googleSignInBtnOnLoadHook);
      document.head.appendChild(googleScriptNode);
    }
  }, [googleSignInBtnOnLoadHook]);

  return (
    <div className={props.className}>
      <div ref={buttonRefHook} className="g_id_signin"></div>
    </div>
  );
};

const GoogleLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="20"
    height="20"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

const DesktopGoogleButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  height: 40px;
  background-color: #131314;
  color: #e3e3e3;
  border: 1px solid #8e918f;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Google Sans', Roboto, Arial, sans-serif;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.25px;
`;

const SignInWithGoogleDesktop: React.FC<SignInWithGoogleProps> = (props) => {
  const { setSession } = useSessionContext();

  useEffect(() => {
    const cleanup = getElectronAPI()?.onAuthCode((code) => {
      trpc.user.signInWithDesktopGoogle
        .mutate({ code })
        .then((response) => {
          if (response.created) {
            welcomePendingSimpleref.welcomePending = true;
          }
          setSession(response.session).then(() => {
            if (response.created) {
              createWelcomeArtifacts();
            }
          });
        })
        .catch(() => {
          // auth code exchange failed
        });
    });
    return cleanup;
  }, [setSession]);

  const handleClick = () => {
    const urls = getElectronAPI()?.getApiUrlsSync();
    const authUrl =
      (urls?.rest || 'https://app.feynote.com/api') + '/auth/desktop-google';
    window.open(authUrl);
  };

  return (
    <div className={props.className}>
      <DesktopGoogleButton type="button" onClick={handleClick}>
        <GoogleLogo />
        <span>Continue with Google</span>
      </DesktopGoogleButton>
    </div>
  );
};

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = (props) => {
  if (getIsElectron()) {
    return <SignInWithGoogleDesktop {...props} />;
  }
  return <SignInWithGoogleWeb {...props} />;
};
