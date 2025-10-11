import { memo, MutableRefObject } from 'react';
import { Editor, JSONContent } from '@tiptap/core';
import { HocuspocusProvider } from '@hocuspocus/provider';

import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import { IonItem } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ArtifactTitleInput } from './ArtifactTitleInput';
import styled from 'styled-components';
import { useObserveYArtifactMeta } from '../../utils/collaboration/useObserveYArtifactMeta';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { TiptapEditor } from './TiptapEditor';
import type { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';

export type ArtifactEditorSetContent = (template: string | JSONContent) => void;

const BottomSpacer = styled.div`
  height: 100px;

  @media print {
    display: none;
  }
`;

type DocArgOptions =
  | {
      yjsProvider: HocuspocusProvider;
      yDoc?: undefined;
    }
  | {
      yjsProvider?: undefined;
      yDoc: YDoc;
    };

type Props = {
  showMenus?: boolean;
  artifactId: string;
  setContentRef?: MutableRefObject<ArtifactEditorSetContent | undefined>;
  editable: boolean;
  authorizedScope: CollaborationConnectionAuthorizedScope;
  onReady?: () => void;
  onTitleChange?: (title: string) => void;
  handleFileUpload?: (editor: Editor, files: File[], pos?: number) => void;
  getFileUrl: (fileId: string) => Promise<string> | string;
  onTocUpdate?: (content: TableOfContentData) => void;
  showBottomSpacer?: boolean;
} & DocArgOptions;

/**
 * This component, slightly misnamed, renders the tiptap editor + title input.
 * It does not handle other artifact types.
 */
export const ArtifactEditor: React.FC<Props> = memo((props) => {
  const { t } = useTranslation();
  const yDoc = props.yDoc || props.yjsProvider.document;
  const yMeta = useObserveYArtifactMeta(yDoc);
  const title = yMeta.title ?? '';
  const theme = yMeta.theme ?? 'default';

  const setMetaProp = (metaPropName: string, value: string) => {
    yDoc.getMap(ARTIFACT_META_KEY).set(metaPropName, value);
  };

  const titleInput = (
    <IonItem lines="none" className="artifactTitle">
      <ArtifactTitleInput
        disabled={!props.editable}
        placeholder={t('artifactRenderer.title.placeholder')}
        value={title}
        onIonInput={(event) => {
          setMetaProp('title', event.target.value?.toString() || '');
          props.onTitleChange?.(event.target.value?.toString() || '');
        }}
        type="text"
      ></ArtifactTitleInput>
    </IonItem>
  );

  return (
    <div data-print-target={`artifact:${props.artifactId}`}>
      <TiptapEditor {...props} theme={theme} prepend={titleInput} />

      {props.showBottomSpacer && <BottomSpacer />}
    </div>
  );
});
