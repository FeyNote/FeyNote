import { ArtifactDetail } from '@feynote/prisma/types';
import { useEffect, useRef, useState } from 'react';
import {
  IonButton,
  IonCheckbox,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonRow,
  useIonAlert,
  useIonModal,
} from '@ionic/react';
import { chevronForward } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import {
  ArtifactEditor,
  ArtifactEditorApplyTemplate,
} from '../editor/ArtifactEditor';
import { ArtifactEditorBlock } from '../editor/blocknoteSchema';
import { InfoButton } from '../info/InfoButton';
import { rootTemplatesById } from './rootTemplates/rootTemplates';
import { RootTemplate } from './rootTemplates/rootTemplates.types';
import {
  SelectTemplateModal,
  SelectTemplateModalProps,
} from './SelectTemplateModal';

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

export const ArtifactRenderer: React.FC<Props> = (props) => {
  const { onArtifactChanged } = props;
  const { t } = useTranslation();
  const [presentAlert] = useIonAlert();
  const [title, setTitle] = useState(props.artifact.title);
  const [isPinned, setIsPinned] = useState(props.artifact.isPinned);
  const [isTemplate, setIsTemplate] = useState(props.artifact.isTemplate);
  const [artifactTemplate, setArtifactTemplate] = useState(
    'artifactTemplate' in props.artifact
      ? props.artifact.artifactTemplate
      : null,
  );
  const [rootTemplateId, setRootTemplateId] = useState(
    props.artifact.rootTemplateId,
  );
  const rootTemplate = rootTemplateId
    ? rootTemplatesById[rootTemplateId]
    : null;
  const [presentSelectTemplateModal, dismissSelectTemplateModal] = useIonModal(
    SelectTemplateModal,
    {
      dismiss: (result) => {
        dismissSelectTemplateModal();
        if (result) {
          if (result.type === 'artifact') {
            applyArtifactTemplate(result.artifactTemplate);
          }
          if (result.type === 'rootTemplate') {
            applyRootTemplate(rootTemplatesById[result.rootTemplateId]);
          }
        }
      },
    } satisfies SelectTemplateModalProps,
  );

  const [blocknoteContent, setBlocknoteContent] = useState(
    props.artifact.json?.blocknoteContent,
  );
  const [blocknoteContentMd, setBlocknoteContentMd] = useState(
    props.artifact.text,
  );
  const editorApplyTemplateRef = useRef<ArtifactEditorApplyTemplate>();

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
      rootTemplateId,
      artifactTemplate,
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
      rootTemplateId,
    });
  }, [
    props.artifact,
    onArtifactChanged,
    title,
    blocknoteContent,
    blocknoteContentMd,
    isPinned,
    isTemplate,
    rootTemplateId,
    artifactTemplate,
  ]);

  const onEditorContentChange = (
    updatedContent: ArtifactEditorBlock[],
    updatedContentMd: string,
  ) => {
    setBlocknoteContent(updatedContent);
    setBlocknoteContentMd(updatedContentMd);
  };

  const applyRootTemplate = (rootTemplate: RootTemplate) => {
    if ('markdown' in rootTemplate) {
      editorApplyTemplateRef.current?.(t(rootTemplate.markdown));
    } else {
      // TODO: This will need to localize rootTemplate.blocks by doing a deep-dive (move to util)
      editorApplyTemplateRef.current?.(rootTemplate.blocks);
    }

    setRootTemplateId(rootTemplate.id);
    setArtifactTemplate(null);
  };

  const applyArtifactTemplate = (artifactTemplate: ArtifactDetail) => {
    const blocks = artifactTemplate.json.blocknoteContent;
    editorApplyTemplateRef.current?.(blocks || []);

    setArtifactTemplate(artifactTemplate);
    setRootTemplateId(null);
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
                applyTemplateRef={editorApplyTemplateRef}
              />
            </div>
          </div>
        </IonCol>
        <IonCol size="12" sizeLg="3">
          <IonButton onClick={save} disabled={!modified} expand="block">
            {t('generic.save')}
          </IonButton>
          <IonItem onClick={() => presentSelectTemplateModal()} button>
            <IonLabel>
              <h3>{t('artifactRenderer.selectTemplate')}</h3>
              {rootTemplate && <p>{t(rootTemplate.title)}</p>}
              {artifactTemplate && <p>{artifactTemplate.title}</p>}
              {!rootTemplate && !artifactTemplate && (
                <p>{t('artifactRenderer.selectTemplate.none')}</p>
              )}
            </IonLabel>
            <IonIcon slot="end" icon={chevronForward} size="small" />
          </IonItem>
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
