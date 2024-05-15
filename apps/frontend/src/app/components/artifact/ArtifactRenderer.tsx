import { ArtifactDetail } from '@feynote/prisma/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IonButton,
  IonCheckbox,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonListHeader,
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
import { ArtifactEditorBlock } from '@feynote/blocknote';
import { InfoButton } from '../info/InfoButton';
import { rootTemplatesById } from './rootTemplates/rootTemplates';
import { RootTemplate } from './rootTemplates/rootTemplates.types';
import {
  SelectTemplateModal,
  SelectTemplateModalProps,
} from './SelectTemplateModal';
import { Prompt } from 'react-router-dom';
import { routes } from '../../routes';
import { markdownToTxt } from '@feynote/shared-utils';

export type NewArtifactDetail = Omit<
  ArtifactDetail,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type EditArtifactDetail = NewArtifactDetail | ArtifactDetail;

interface Props {
  artifact: EditArtifactDetail;
  save: (artifact: EditArtifactDetail) => void;
  onArtifactChanged?: (artifact: EditArtifactDetail) => void;
  presentSelectTemplateModalRef?: React.MutableRefObject<
    (() => void) | undefined
  >;
}

export const ArtifactRenderer: React.FC<Props> = (props) => {
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
    props.artifact.json?.blocknoteContentMd || '',
  );
  const blocknoteContentText = useMemo(
    () => markdownToTxt(blocknoteContentMd),
    [blocknoteContentMd],
  );
  const [artifactTemplate, setArtifactTemplate] = useState(
    props.artifact.artifactTemplate,
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
      enableOverrideWarning: !!blocknoteContentMd.length,
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
  if (props.presentSelectTemplateModalRef) {
    props.presentSelectTemplateModalRef.current = presentSelectTemplateModal;
  }

  const editorApplyTemplateRef = useRef<ArtifactEditorApplyTemplate>();

  const modified =
    props.artifact.title !== title ||
    props.artifact.isPinned !== isPinned ||
    props.artifact.isTemplate !== isTemplate ||
    props.artifact.text !== blocknoteContentText ||
    props.artifact.rootTemplateId !== rootTemplateId ||
    props.artifact.artifactTemplate?.id !== artifactTemplate?.id;
  const [enableRouterPrompt, setEnableRouterPrompt] = useState(modified);

  useEffect(() => {
    if (modified) {
      window.onbeforeunload = () => true;
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [modified]);

  const save = () => {
    if (!title.trim()) {
      presentAlert({
        header: t('artifactDetail.missingTitle.title'),
        message: t('artifactDetail.missingTitle.message'),
        buttons: [t('generic.okay')],
      });

      return;
    }
    setEnableRouterPrompt(false);

    props.save({
      ...props.artifact,
      title,
      text: blocknoteContentText,
      json: {
        blocknoteContent,
        blocknoteContentMd,
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
      text: blocknoteContentText,
      json: {
        blocknoteContent,
        blocknoteContentMd,
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
    setEnableRouterPrompt(true);
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
      <Prompt when={enableRouterPrompt} message={t('generic.unsavedChanges')} />
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
          {!!props.artifact.templatedArtifacts.length && (
            <>
              <IonListHeader>
                {t('artifactRenderer.templatedArtifacts')}
                <InfoButton
                  message={t('artifactRenderer.templatedArtifacts.help')}
                />
              </IonListHeader>
              {props.artifact.templatedArtifacts.map((el) => (
                <IonItem
                  key={el.id}
                  routerLink={routes.artifact.build({ id: el.id })}
                  button
                >
                  <IonLabel>{el.title}</IonLabel>
                  <IonIcon slot="end" icon={chevronForward} />
                </IonItem>
              ))}
            </>
          )}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
