import { ArtifactDetail } from '@feynote/prisma/types';
import { useEffect, useState } from 'react';
import {
  IonButton,
  IonCheckbox,
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonRow,
  useIonAlert,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ArtifactEditor } from '../editor/ArtifactEditor';
import { ArtifactEditorBlock } from '../editor/blocknoteSchema';
import { InfoButton } from '../info/InfoButton';

type ExistingArtifactOnlyFields =
  | 'id'
  | 'userId'
  | 'createdAt'
  | 'updatedAt'
  | 'templatedArtifacts'
  | 'artifactTemplate';

export type EditArtifactDetail =
  | Omit<ArtifactDetail, ExistingArtifactOnlyFields>
  | ArtifactDetail;

interface Props {
  artifact: EditArtifactDetail;
  save: (artifact: EditArtifactDetail) => void;
  onArtifactChanged?: (artifact: EditArtifactDetail) => void;
}

export const ArtifactRenderer = (props: Props) => {
  const { onArtifactChanged } = props;
  const { t } = useTranslation();
  const [presentAlert] = useIonAlert();
  const [title, setTitle] = useState(props.artifact.title);
  const [isPinned, setIsPinned] = useState(props.artifact.isPinned);
  const [isTemplate, setIsTemplate] = useState(props.artifact.isTemplate);
  const [blocknoteContent, setBlocknoteContent] = useState(
    props.artifact.json?.blocknoteContent,
  );
  const [blocknoteContentMd, setBlocknoteContentMd] = useState(
    props.artifact.text,
  );

  const modified =
    props.artifact.title !== title ||
    props.artifact.isPinned !== isPinned ||
    props.artifact.isTemplate !== isTemplate ||
    props.artifact.text !== blocknoteContentMd;

  const save = () => {
    if (!title.trim()) {
      presentAlert({
        header: t('artifactDetail.missingTitle.title'),
        message: t('artifactDetail.missingTitle.message'),
        buttons: [t('generic.okay')],
      });

      return;
    }

    props.save({
      ...props.artifact,
      title,
      text: blocknoteContentMd,
      json: {
        blocknoteContent,
      },
      isPinned,
      isTemplate,
    });
  };

  useEffect(() => {
    onArtifactChanged?.({
      ...props.artifact,
      title,
      text: blocknoteContentMd,
      json: {
        blocknoteContent,
      },
      isPinned,
      isTemplate,
    });
  }, [
    props.artifact,
    onArtifactChanged,
    title,
    blocknoteContent,
    blocknoteContentMd,
    isPinned,
    isTemplate,
  ]);

  const onEditorContentChange = (
    updatedContent: ArtifactEditorBlock[],
    updatedContentMd: string,
  ) => {
    setBlocknoteContent(updatedContent);
    setBlocknoteContentMd(updatedContentMd);
  };

  return (
    <IonGrid>
      <IonRow>
        <IonCol size="12" sizeLg="9">
          <div className="ion-margin-start ion-margin-end ion-padding-start ion-padding-end">
            <IonItem>
              <IonInput
                placeholder={t('artifactRenderer.title.placeholder')}
                label={t('artifactRenderer.title.label')}
                labelPlacement="stacked"
                value={title}
                onIonInput={(event) =>
                  setTitle((event.target.value || '').toString())
                }
                type="text"
              ></IonInput>
            </IonItem>
            <div>
              <ArtifactEditor
                onContentChange={onEditorContentChange}
                initialContent={blocknoteContent}
              />
            </div>
          </div>
        </IonCol>
        <IonCol size="12" sizeLg="3">
          <IonButton onClick={save} disabled={!modified} expand="block">
            {t('generic.save')}
          </IonButton>
          <br />
          <IonItem>
            <IonCheckbox
              labelPlacement="end"
              justify="start"
              checked={isPinned}
              onIonChange={(event) => setIsPinned(event.target.checked)}
            >
              {t('artifactRenderer.isPinned')}
            </IonCheckbox>
            <InfoButton
              slot="end"
              message={t('artifactRenderer.isPinned.help')}
            />
          </IonItem>
          <IonItem>
            <IonCheckbox
              labelPlacement="end"
              justify="start"
              checked={isTemplate}
              onIonChange={(event) => setIsTemplate(event.target.checked)}
            >
              {t('artifactRenderer.isTemplate')}
            </IonCheckbox>
            <InfoButton
              slot="end"
              message={t('artifactRenderer.isTemplate.help')}
            />
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
