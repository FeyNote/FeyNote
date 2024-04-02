import { ArtifactDetail } from '@dnd-assistant/prisma/types';
import { useState } from 'react';
import {
  IonButton,
  IonLabel,
  IonListHeader,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Editor } from '../editor/Editor';
import { Block } from '@blocknote/core';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';

interface Props {
  artifact: ArtifactDetail;
}

export const ArtifactRenderer = (props: Props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);
  const [blocknoteContent, setBlocknoteContent] = useState(props.artifact.json);
  const [blocknoteContentMd, setBlocknoteContentMd] = useState(
    props.artifact.text
  );

  const save = () => {
    setSaving(true);

    trpc.artifact.updateArtifact
      .mutate({
        id: props.artifact.id,
        json: blocknoteContent,
        text: blocknoteContentMd,
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const onEditorContentChange = (
    updatedContent: Block[],
    updatedContentMd: string
  ) => {
    setModified(true);
    setBlocknoteContent(updatedContent);
    setBlocknoteContentMd(updatedContentMd);
  };

  return (
    <div>
      <IonListHeader>
        <IonLabel>{props.artifact.title}</IonLabel>
        {saving && <IonSpinner></IonSpinner>}
        {!saving && modified && (
          <IonButton onClick={save}>{t('generic.save')}</IonButton>
        )}
      </IonListHeader>
      <div className="ion-margin-start ion-margin-end ion-padding-start ion-padding-end">
        <Editor
          onContentChange={onEditorContentChange}
          initialContent={blocknoteContent as Block[]} // We cast with hope
        />
      </div>
    </div>
  );
};
