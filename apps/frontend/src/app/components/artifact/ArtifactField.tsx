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

type ArtifactDetailField = ArtifactDetail['fields'][0];

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
      if (
        props.field.fieldTemplate.type === 'Text' ||
        props.field.fieldTemplate.type === 'TextArea'
      ) {
        saveText();
      }
    }
  };

  return (
    <div>
      <IonListHeader>
        <IonLabel>{t(props.field.fieldTemplate.title)}</IonLabel>
        {saving ? (
          <IonSpinner></IonSpinner>
        ) : (
          <IonButton onClick={saveEditClick}>
            {t(edit ? 'generic.save' : 'generic.edit')}
          </IonButton>
        )}
      </IonListHeader>
      <div className="ion-margin-start ion-margin-end ion-padding-start ion-padding-end">
        {props.field.fieldTemplate.type === 'Text' && (
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
        {props.field.fieldTemplate.type === 'TextArea' && (
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
        {props.field.fieldTemplate.type === 'Images' && (
          <div>
            {edit
              ? 'Image uploader not yet implemented'
              : props.field.fieldImages.length
              ? props.field.fieldImages.map((fieldImage) => (
                  <img
                    alt={t('artifactField.imageAlt')}
                    src={fieldImage.image.storageKey}
                    key={fieldImage.id}
                  />
                ))
              : t('artifactField.noImages')}
          </div>
        )}
      </div>
    </div>
  );
};
