import { memo, MutableRefObject } from 'react';
import { Editor, JSONContent } from '@tiptap/core';
import { HocuspocusProvider } from '@hocuspocus/provider';

import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ArtifactTitleContainer } from './ArtifactTitleContainer';
import { ArtifactTitleField } from './ArtifactTitleField';
import { useObserveYArtifactMeta } from '../../utils/collaboration/useObserveYArtifactMeta';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { TiptapEditor } from './TiptapEditor';
import type { CollaborationConnectionAuthorizationState } from '../../utils/collaboration/collaborationManager';

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
  authorizationState: CollaborationConnectionAuthorizationState;
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
  const yMeta = useObserveYArtifactMeta(yDoc).meta;
  const title = yMeta.title ?? '';
  const theme = yMeta.theme ?? 'default';

  const setMetaProp = (metaPropName: string, value: string) => {
    yDoc.getMap(ARTIFACT_META_KEY).set(metaPropName, value);
  };

  const titleInput = (
    <ArtifactTitleContainer>
      <ArtifactTitleField
        disabled={!props.editable}
        placeholder={
          props.editable
            ? t('artifactRenderer.title.placeholder')
            : t('generic.untitled')
        }
        value={title}
        onChange={(event) => {
          setMetaProp('title', event.target.value);
          props.onTitleChange?.(event.target.value);
        }}
        type="text"
      />
    </ArtifactTitleContainer>
  );

  return (
    <div>
      <TiptapEditor {...props} theme={theme} prepend={titleInput} />

      {props.showBottomSpacer && <BottomSpacer />}
    </div>
  );
});
