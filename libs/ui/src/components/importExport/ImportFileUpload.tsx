import { IonButton, IonContent, IonIcon, IonPage, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { closeOutline } from 'ionicons/icons';
import { usePaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { uploadImportJob } from '../../utils/job/uploadImportJob';
import { ProgressBar } from '../info/ProgressBar';
import type { ImportFormat } from '@feynote/prisma/types';
import { PaneNav } from '../pane/PaneNav';

const ActionErrorText = styled.p`
  font-size: 0.8rem;
`;

const Header = styled.h1`
  margin-top: 0;
`;

const Subtext = styled(IonText)`
  opacity: 0.6;
  padding-bottom: 8px;
  display: block;
`;

const HelpText = styled.div`
  opacity: 0.6;
  font-size: 12px;
  font-style: italics;
  padding-top: 8px;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  format: ImportFormat;
}

const FILE_SIZE_LIMIT = 500000000; //500MB
const ALLOWED_FILE_TYPES = ['application/zip', 'application/x-zip-compressed'];
const ALLOWED_FILE_TYPES_STR = ALLOWED_FILE_TYPES.join(', ');

export const ImportFileUpload: React.FC<Props> = (props: Props) => {
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>();
  const [fileInputError, setFileInputError] = useState<string | null>(null);
  const [disableUploadBtn, setDisableUploadBtn] = useState(false);
  const { navigate } = usePaneContext();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [fileUploadProgress, setFileUploadProgress] = useState<null | number>(
    null,
  );

  const instructions = useMemo(() => {
    switch (props.format) {
      case 'obsidian':
        return t('importFileUpload.instructions.obsidian');
      case 'logseq':
        return t('importFileUpload.instructions.logseq');
      default:
        return t('importFileUpload.instructions.default');
    }
  }, [props.format, t]);

  const help = useMemo(() => {
    switch (props.format) {
      case 'obsidian':
        return {
          text: t('importFileUpload.help.obsidian'),
          docsLink: 'https://docs.feynote.com/import/obsidian',
        };
      case 'logseq':
        return {
          text: t('importFileUpload.help.logseq'),
          docsLink: 'https://docs.feynote.com/import/logseq',
        };
      default:
        return {
          text: t('importFileUpload.help.default'),
          docsLink: 'https://docs.feynote.com/import/zip',
        };
    }
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selectedfile = e.target.files[0];
    if (!ALLOWED_FILE_TYPES.includes(selectedfile.type))
      return setFileInputError(
        `${t('import.file.error.type')} ${ALLOWED_FILE_TYPES_STR}`,
      );
    if (selectedfile.size >= FILE_SIZE_LIMIT)
      return setFileInputError(
        `${t('import.file.error.size')} ${FILE_SIZE_LIMIT / 1000000}MB`,
      );
    setFile(selectedfile);
    setFileInputError(null);
  };

  const toggleFileInput = () => {
    fileUploadRef.current?.click();
  };

  const clearFileSelection = () => {
    setFile(null);
    setFileInputError(null);
    if (fileUploadRef.current) fileUploadRef.current.value = '';
  };

  const uploadFile = async () => {
    if (!file) return;
    setDisableUploadBtn(true);
    const uploadProgressListener = (progress: number | undefined) => {
      if (progress === undefined) return;
      setFileUploadProgress(progress);
    };
    try {
      await uploadImportJob({
        file: file,
        format: props.format,
        onProgress: uploadProgressListener,
      });
      navigate(PaneableComponent.Import, {}, PaneTransition.Push);
    } catch (e) {
      handleTRPCErrors(e, {
        413: t('import.fileTooLarge'),
      });
      console.error(e);
    }
    setDisableUploadBtn(false);
  };

  return (
    <IonPage>
      <PaneNav title={t('importFileUpload.title')} />
      <IonContent className="ion-padding">
        <div>
          <Header>{t('import.file.header')}</Header>
          <Subtext>{instructions}</Subtext>
          {file ? (
            <>
              <Container>
                <IonText color="dark">{file.name}</IonText>
                <IonButton
                  size="small"
                  fill="clear"
                  color="dark"
                  onClick={clearFileSelection}
                >
                  <IonIcon slot="icon-only" icon={closeOutline} size="small" />
                </IonButton>
              </Container>
              <div>
                <IonButton
                  disabled={disableUploadBtn}
                  fill="outline"
                  size="small"
                  onClick={uploadFile}
                >
                  {t('generic.submit')}
                </IonButton>
                {fileUploadProgress && (
                  <ProgressBar progress={fileUploadProgress} />
                )}
              </div>
            </>
          ) : (
            <div>
              <IonButton size="small" onClick={toggleFileInput}>
                {t('import.file.browse')}
              </IonButton>
            </div>
          )}
          {fileInputError && (
            <IonText color="danger">
              <ActionErrorText>{fileInputError}</ActionErrorText>
            </IonText>
          )}
          <input
            ref={fileUploadRef}
            hidden={true}
            accept={ALLOWED_FILE_TYPES_STR}
            type="file"
            onChange={handleFileChange}
          />
          <HelpText>
            <a href={help.docsLink}>{help.text}</a>
          </HelpText>
        </div>
      </IonContent>
    </IonPage>
  );
};
