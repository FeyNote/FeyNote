import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { uploadImportJob } from '../../utils/job/uploadImportJob';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { useTranslation } from 'react-i18next';

export interface SignInWithGoogleProps {
  className?: string;
}

const getGoogleRef = () => {
  return ((window as any).google);
};

const getGAPIRef = () => {
  return (window as any).gapi;
};

export const GFP: React.FC<SignInWithGoogleProps> = (props) => {
  const [tokenClient, setTokenClient] = useState<null | any>(null);
  const [isGSIInit, setIsGSIInit] = useState(false)
  const [isGAPIInit, setIsGAPIInit] = useState(false)
  const [isPickerInit, setIsPickerInit] = useState(false)
  const [isClientLoaded, setIsClientLoaded] = useState(false)
  const [accessToken, setAccessToken] = useState(null)
  const { setSession } = useContext(SessionContext);
  const buttonRef = useRef<HTMLDivElement>(undefined);
  const { navigate } = useContext(PaneContext);
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [fileUploadProgress, setFileUploadProgress] = useState<null | number>(
    null,
  );

  const fetchAccessToken = useCallback(() => {
      if (accessToken === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
      } else {
        tokenClient.requestAccessToken({prompt: ''});
      }
  }, [tokenClient])

  const downloadDocxByFileId = async (file: any) => {
      const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      const url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${mimeType}`;
      const response = await fetch(url, {
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      })
      if (!response.ok) {
        console.error('Failed to fetch docx content')
      }
      const blob = await response.blob()
      const fileToUpload = new File([blob], `${file.name}.docx`, {
        type: mimeType,
      });

      const uploadProgressListener = (progress: number | undefined) => {
        if (progress === undefined) return;
        setFileUploadProgress(progress);
      };
      try {
        await uploadImportJob({
          file: fileToUpload,
          format: 'docx',
          onProgress: uploadProgressListener,
        });
        navigate(PaneableComponent.Import, {}, PaneTransition.Push);
      } catch (e) {
        handleTRPCErrors(e, {
          413: t('import.fileTooLarge'),
        });
        console.error(e);
      }
  }

  useEffect(() => {
    if (isPickerInit && isGSIInit && isGAPIInit) {
      if (!accessToken) {
        return fetchAccessToken()
      }
      const google = getGoogleRef()
      if (!google || !google.picker) return
      const picker = new google.picker.PickerBuilder()
          .addViewGroup(
            new google.picker.ViewGroup(google.picker.ViewId.DOCUMENTS))
          .setOAuthToken(accessToken)
          .setDeveloperKey('AIzaSyBqLzMS_EXF2YfnPwW-EV_LZV4eIAiZUXY')
          .setCallback((data: any) => {
            const google = getGoogleRef()
            if (!google) return
            if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
              const file = data[google.picker.Response.DOCUMENTS][0];
              downloadDocxByFileId(file)
            }
          })
          .setAppId(458922288770)
          .build();
      picker.setVisible(true);
    }
  }, [accessToken, isPickerInit, isGSIInit, fetchAccessToken]);

  const gAPIOnLoadHook = useCallback(() => {
    const gapi = getGAPIRef()
    if (!gapi) return
    setIsGAPIInit(true)
    gapi.load('picker', () => {
      setIsPickerInit(true)
    })
    gapi.load('client', () => {
      setIsClientLoaded(true)
    })
  }, [])

  const gsiOnLoadHook = useCallback(async () => {
    setIsGSIInit(true)
    const tokenClient = await getGoogleRef()?.accounts.oauth2.initTokenClient({
      client_id: '458922288770-u99e4b2eq5pl4fd26nnk8kmt6mtqogka.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (response: any) => {
        if (response.error !== undefined) {
          throw (response);
        }
        const accessToken = response.access_token;
        setAccessToken(accessToken)
      },
    });
    setTokenClient(tokenClient)
  }, []);

  const loadScripts = useCallback(() => {
    const gsiScriptNodeId = 'gsi-client-script';
    const gsiNodeExists = document.getElementById(gsiScriptNodeId);
    if (!gsiNodeExists) {
      const gsiScriptNode = document.createElement('script');
      gsiScriptNode.src = 'https://accounts.google.com/gsi/client';
      gsiScriptNode.async = true;
      gsiScriptNode.id = gsiScriptNodeId;
      gsiScriptNode.addEventListener('load', gsiOnLoadHook);
      document.head.appendChild(gsiScriptNode);
    }
    const gapiScriptNodeId = 'gfp-client-script';
    const gapiNodeExists = document.getElementById(gapiScriptNodeId);
    if (!gapiNodeExists) {
      const gapiScriptNode = document.createElement('script');
      gapiScriptNode.src = 'https://apis.google.com/js/api.js';
      gapiScriptNode.async = true;
      gapiScriptNode.id = gsiScriptNodeId;
      gapiScriptNode.addEventListener('load', gAPIOnLoadHook);
      document.head.appendChild(gapiScriptNode);
    }
  }, [gsiOnLoadHook, gAPIOnLoadHook]);

  return (
    <button className={props.className} onClick={() => loadScripts()}>Google File Picker Test</button>
  );
};
