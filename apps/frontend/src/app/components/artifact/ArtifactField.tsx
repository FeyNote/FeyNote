import { ArtifactDetail } from '@dnd-assistant/prisma/types';
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonListHeader,
} from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TiptapEditor } from '../tiptap/TiptapEditor';

type ArtifactDetailField = ArtifactDetail['fields'][0];

interface Props {
  field: ArtifactDetailField;
  initializeAsEdit?: boolean;
}

export const ArtifactField = (props: Props) => {
  const { t } = useTranslation();
  const [edit, setEdit] = useState(props.initializeAsEdit ?? false);
  const [updatedText, setUpdatedText] = useState(props.field.text || '');

  const textDisplayClick = () => {
    const selection = window.getSelection();
    if (!selection?.toString()) {
      setEdit(true);
    }
  };

  return (
    <div>
      <IonListHeader>
        <IonLabel>{t(props.field.fieldTemplate.title)}</IonLabel>
        <IonButton onClick={() => setEdit(!edit)}>
          {t(edit ? 'generic.save' : 'generic.edit')}
        </IonButton>
      </IonListHeader>
      <div className="ion-margin-start ion-margin-end ion-padding-start ion-padding-end">
        {props.field.fieldTemplate.type === 'Text' && (
          <div>
            {edit ? (
              <IonItem>
                <IonInput
                  value={updatedText}
                  onIonInput={(event) =>
                    setUpdatedText(event.detail.value || '')
                  }
                />
              </IonItem>
            ) : (
              <IonItem onClick={() => textDisplayClick()}>
                <IonLabel>{updatedText}</IonLabel>
              </IonItem>
            )}
          </div>
        )}
        {props.field.fieldTemplate.type === 'TextArea' && (
          <div>
            {edit ? (
              <TiptapEditor content={props.field.text || undefined} />
            ) : (
              <IonItem>
                <IonLabel>
                  <div
                    onClick={textDisplayClick}
                    dangerouslySetInnerHTML={{ __html: props.field.text || '' }}
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
              : props.field.images.length
              ? props.field.images.map((image) => (
                  <img
                    alt={t('artifactField.imageAlt')}
                    src={image.storageKey}
                    key={image.id}
                  />
                ))
              : t('artifactField.noImages')}
          </div>
        )}
      </div>
    </div>
  );
};
