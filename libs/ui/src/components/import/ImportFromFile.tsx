import {
  IonButton,
  IonButtons,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonText,
} from '@ionic/react';
import { PaneNav } from '../pane/PaneNav';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, useState } from 'react';
import styled from 'styled-components';
import { trpc } from '../../utils/trpc';
import { ImportJobType } from '@prisma/client';
import axios from 'axios';

const FileErrorText = styled.p`
  font-size: 0.8rem;
`;

interface Props {
  title: string;
  type: ImportJobType;
}

const FILE_SIZE_LIMIT = 5000000;
const ALLOWED_FILE_TYPES = ['application/zip'];
const ALLOWED_FILE_TYPES_STR = ALLOWED_FILE_TYPES.join(', ');

export const ImportFromFile: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>();
  const [fileInputError, setFileInputError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selectedfile = e.target.files[0];
    if (!ALLOWED_FILE_TYPES.includes(selectedfile.type))
      return setFileInputError(
        `${t('upload.input.error.type')} ${ALLOWED_FILE_TYPES_STR}`,
      );
    if (selectedfile.size >= FILE_SIZE_LIMIT)
      return setFileInputError(
        `${t('upload.input.error.size')} ${FILE_SIZE_LIMIT / 1000000}MB`,
      );
    setFile(selectedfile);
    setFileInputError(null);
  };

  const uploadFile = async () => {
    if (!file) return;
    const s3PresignedUrl = await trpc.import.createImportJob.mutate({
      name: file.name,
      mimetype: file.type,
      type: props.type,
    });

    const response = await fetch(s3PresignedUrl, {
      method: 'PUT',
      body: file,
    });

    console.log(`response: ${await response.json()}`);
  };

  return (
    <IonPage>
      <PaneNav title={props.title} />
      <IonContent className="ion-padding">
        <h4>File Selection</h4>
        <p>Please zip and select your obsidian vault file.</p>
        <input
          accept={ALLOWED_FILE_TYPES_STR}
          type="file"
          onChange={handleFileChange}
        />
        {fileInputError && (
          <IonText color="danger">
            <FileErrorText>{fileInputError}</FileErrorText>
          </IonText>
        )}
        <IonButtons>
          <IonButton onClick={uploadFile}>{t('generic.upload')}</IonButton>
        </IonButtons>
      </IonContent>
    </IonPage>
  );
};
