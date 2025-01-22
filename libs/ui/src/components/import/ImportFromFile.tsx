import { IonButton, IonIcon, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, useRef, useState } from 'react';
import styled from 'styled-components';
import { trpc } from '../../utils/trpc';
import { ImportJobType } from '@prisma/client';
import { closeOutline } from 'ionicons/icons';

const FileErrorText = styled.p`
  font-size: 0.8rem;
`;

const Header = styled.h3`
  margin-top: 0;
`;

const FileInstructions = styled(IonText)`
  opacity: 0.6;
  padding-bottom: 8px;
  display: block;
`;

const FileInfoContainer = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  type: ImportJobType;
  fetchImportJobs: () => void;
}

const FILE_SIZE_LIMIT = 5000000; //5MB
const ALLOWED_FILE_TYPES = ['application/zip', 'application/x-zip-compressed'];
const ALLOWED_FILE_TYPES_STR = ALLOWED_FILE_TYPES.join(', ');

export const ImportFromFile: React.FC<Props> = (props: Props) => {
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>();
  const [fileInputError, setFileInputError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selectedfile = e.target.files[0];
    if (!ALLOWED_FILE_TYPES.includes(selectedfile.type))
      return setFileInputError(
        `${t('import.file.input.error.type')} ${ALLOWED_FILE_TYPES_STR}`,
      );
    if (selectedfile.size >= FILE_SIZE_LIMIT)
      return setFileInputError(
        `${t('import.file.input.error.size')} ${FILE_SIZE_LIMIT / 1000000}MB`,
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
    try {
      const { importJobId, s3SignedURL } = await trpc.import.createImportJob.mutate({
        name: file.name,
        mimetype: file.type,
        type: props.type,
      });

      await fetch(s3SignedURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      await trpc.import.startImportJob.mutate({
        id: importJobId,
      });
      clearFileSelection();
      props.fetchImportJobs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="ion-padding">
      <Header>File Selection</Header>
      <FileInstructions>
        Please zip and select your obsidian vault file.
      </FileInstructions>
      {file ? (
        <>
          <FileInfoContainer>
            <IonText color="dark">{file.name}</IonText>
            <IonButton
              size="small"
              fill="clear"
              color="dark"
              onClick={clearFileSelection}
            >
              <IonIcon slot="icon-only" icon={closeOutline} size="small" />
            </IonButton>
          </FileInfoContainer>
          <div>
            <IonButton fill="outline" size="small" onClick={uploadFile}>
              Submit
            </IonButton>
          </div>
        </>
      ) : (
        <div>
          <IonButton size="small" onClick={toggleFileInput}>
            Browse
          </IonButton>
        </div>
      )}
      {fileInputError && (
        <IonText color="danger">
          <FileErrorText>{fileInputError}</FileErrorText>
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
