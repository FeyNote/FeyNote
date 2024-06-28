import { useCallback, useContext, useEffect, useRef } from 'react';
import { trpc } from '../../../utils/trpc';
import { SessionContext } from '../../context/session/SessionContext';
import { useIonRouter, useIonToast } from '@ionic/react';
import { routes } from '../../routes';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';

interface Props {
  className?: string;
}

const getGoogleRef = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).google;
};

export const SignInWithGoogle: React.FC<Props> = (props) => {
  const [presentToast] = useIonToast();
  const { setSession } = useContext(SessionContext);
  const router = useIonRouter();
  const buttonRef = useRef<HTMLDivElement>();

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
        .then((_session) => {
          setSession(_session);
          router.push(routes.dashboard.build());
        })
        .catch((error) => {
          handleTRPCErrors(error, presentToast);
        });
    },
    [router, presentToast, setSession],
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
