import { IonButton, IonIcon, IonProgressBar, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, useContext, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { closeOutline } from 'ionicons/icons';
import { ImportFormat } from '@feynote/prisma/types';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { uploadFileToApi } from '../../utils/files/uploadFileToApi';
import { FilePurpose } from '@prisma/client';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { trpc } from '../../utils/trpc';

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

export const ImportFromFile: React.FC<Props> = (props: Props) => {
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>();
  const [fileInputError, setFileInputError] = useState<string | null>(null);
  const [disableUploadBtn, setDisableUploadBtn] = useState(false);
  const { navigate } = useContext(PaneContext);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [fileUploadProgress, setFileUploadProgress] = useState<null | number>(null);

  const instructions = useMemo(() => {
    if (props.format === ImportFormat.Obsidian) {
      return t('importFromObsidian.instructions');
    } else {
      return t('importFromLogseq.instructions');
    }
  }, [props.format, t]);

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
      if (progress === undefined) return
      setFileUploadProgress(progress)
    }
    try {
      const fileDTO = await uploadFileToApi({
        file: file,
        purpose: FilePurpose.job,
        onProgress: uploadProgressListener,
      })
      await trpc.job.createImportJob.mutate({
        format: props.format,
        fileId: fileDTO.id,
      })
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
            { fileUploadProgress && <IonProgressBar value={fileUploadProgress}></IonProgressBar>}
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
    </div>
  );
};
