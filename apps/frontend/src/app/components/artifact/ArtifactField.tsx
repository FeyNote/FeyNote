import { ArtifactDetail } from '@dnd-assistant/prisma/types';
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonListHeader,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TiptapEditor } from '../tiptap/TiptapEditor';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { FieldType } from '@prisma/client';

type ArtifactDetailField = ArtifactDetail['artifactFields'][0];

interface Props {
  field: ArtifactDetailField;
  initializeAsEdit?: boolean;
}

export const ArtifactField = (props: Props) => {
  const { t } = useTranslation();
  const [edit, setEdit] = useState(props.initializeAsEdit ?? false);
  const [fieldText, setFieldText] = useState(props.field.text || '');
  const [presentToast] = useIonToast();
  const [saving, setSaving] = useState(false);

  const textDisplayClick = () => {
    const selection = window.getSelection();
    if (!selection?.toString()) {
      setEdit(true);
    }
  };

  const saveText = () => {
    setSaving(true);
    trpc.field.updateField
      .mutate({
        id: props.field.id,
        text: fieldText,
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const saveEditClick = () => {
    setEdit(!edit);

    if (edit) {
      if (props.field.type === 'Text' || props.field.type === 'TextArea') {
        saveText();
      }
    }
  };

  return (
    <div>
      <IonListHeader>
        <IonLabel>{t(props.field.title)}</IonLabel>
        {saving ? (
          <IonSpinner></IonSpinner>
        ) : (
          <IonButton onClick={saveEditClick}>
            {t(edit ? 'generic.save' : 'generic.edit')}
          </IonButton>
        )}
      </IonListHeader>
      <div className="ion-margin-start ion-margin-end ion-padding-start ion-padding-end">
        {props.field.type === FieldType.Text && (
          <div>
            {edit ? (
              <IonItem>
                <IonInput
                  value={fieldText}
                  onIonInput={(event) => setFieldText(event.detail.value || '')}
                />
              </IonItem>
            ) : (
              <IonItem onClick={() => textDisplayClick()}>
                <IonLabel>{fieldText}</IonLabel>
              </IonItem>
            )}
          </div>
        )}
        {props.field.type === FieldType.TextArea && (
          <div>
            {edit ? (
              <TiptapEditor
                content={props.field.text || undefined}
                onContentChange={(updatedContent) =>
                  setFieldText(updatedContent)
                }
              />
            ) : (
              <IonItem>
                <IonLabel>
                  <div
                    onClick={textDisplayClick}
                    dangerouslySetInnerHTML={{ __html: fieldText || '' }}
                  ></div>
                </IonLabel>
              </IonItem>
            )}
          </div>
        )}
        {props.field.type === FieldType.Images && (
          <div>
            {edit
              ? 'Image uploader not yet implemented'
              : props.field.artifactImages.length
              ? props.field.artifactImages.map((artifactImage) => (
                  <img
                    alt={t('artifactField.imageAlt')}
                    src={artifactImage.image.storageKey}
                    key={artifactImage.id}
                  />
                ))
              : t('artifactField.noImages')}
          </div>
        )}
      </div>
    </div>
  );
};
