import { memo, MutableRefObject, useContext, useEffect, useState } from 'react';
import type { ArtifactTheme } from '@prisma/client';
import { EditorContent } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import { TiptapCollabProvider } from '@hocuspocus/provider';

import { ArtifactEditorStyles } from './ArtifactEditorStyles';
import { KnownArtifactReference } from './tiptap/extensions/artifactReferences/KnownArtifactReference';
import { useArtifactEditor } from './useTiptapEditor';
import { ArtifactEditorContainer } from './ArtifactEditorContainer';
import { DragHandle } from './tiptap/extensions/globalDragHandle/DragHandle';
import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY, getMetaFromYArtifact } from '@feynote/shared-utils';
import { EventContext } from '../../context/events/EventContext';
import { IonInput, IonItem } from '@ionic/react';
import { EventName } from '../../context/events/EventName';
import { useTranslation } from 'react-i18next';

export type ArtifactEditorSetContent = (template: string | JSONContent) => void;

type DocArgOptions =
  | {
      yjsProvider: TiptapCollabProvider;
      yDoc: undefined;
    }
  | {
      yjsProvider: undefined;
      yDoc: YDoc;
    };

type Props = {
  setContentRef?: MutableRefObject<ArtifactEditorSetContent | undefined>;
  editable: boolean;
  knownReferences: Map<string, KnownArtifactReference>;
  onReady?: () => void;
  onTitleChange?: (title: string) => void;
} & DocArgOptions;

export const ArtifactEditor: React.FC<Props> = memo((props) => {
  const yDoc = props.yDoc || props.yjsProvider.document;
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState<ArtifactTheme>('default');
  const { eventManager } = useContext(EventContext);
  const { t } = useTranslation();

  const editor = useArtifactEditor({
    ...props,
  });

  if (props.setContentRef) {
    props.setContentRef.current = (content) => {
      editor?.commands.setContent(content);
    };
  }

  useEffect(() => {
    const artifactMetaMap = yDoc.getMap('artifactMeta');

    const listener = () => {
      const yArtifactMeta = getMetaFromYArtifact(yDoc);
      setTitle(yArtifactMeta.title ?? title);
      setTheme(yArtifactMeta.theme ?? theme);
    };

    listener();
    artifactMetaMap.observe(listener);
    return () => artifactMetaMap.unobserve(listener);
  }, [yDoc]);

  const setMetaProp = (metaPropName: string, value: any) => {
    (yDoc.getMap(ARTIFACT_META_KEY) as any).set(metaPropName, value);
  };

  return (
    <ArtifactEditorContainer>
      <ArtifactEditorStyles data-theme={theme}>
        <IonItem lines="none" className="artifactTitle">
          <IonInput
            disabled={!props.editable}
            placeholder={t('artifactRenderer.title.placeholder')}
            value={title}
            onIonInput={(event) => {
              setMetaProp('title', event.target.value || '');
              eventManager.broadcast([EventName.ArtifactTitleUpdated]);
              props.onTitleChange?.((event.target.value || '').toString());
            }}
            type="text"
          ></IonInput>
        </IonItem>
        <EditorContent editor={editor}></EditorContent>
        <DragHandle />
      </ArtifactEditorStyles>
    </ArtifactEditorContainer>
  );
});
