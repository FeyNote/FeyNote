import { TiptapCollabProvider } from '@hocuspocus/provider';
import { Doc as YDoc } from 'yjs';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import { memo, useContext, useEffect, useState } from 'react';
import type { ArtifactDTO } from '@feynote/global-types';
import {
  ARTIFACT_META_KEY,
  getMetaFromYArtifact,
  PreferenceNames,
} from '@feynote/shared-utils';
import type { ArtifactTheme } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { IonItem } from '@ionic/react';
import { ArtifactTitleInput } from '../editor/ArtifactTitleInput';
import { ArtifactDrawStyles } from './ArtifactDrawStyles';
import { PreferencesContext } from '../../context/preferences/PreferencesContext';
import { SessionContext } from '../../context/session/SessionContext';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { useYjsTLDrawStore } from './useYjsTLDrawStore';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';

interface Props {
  knownReferences: Map<string, KnownArtifactReference>;
  incomingArtifactReferences: ArtifactDTO['incomingArtifactReferences'];
  y: TiptapCollabProvider;
  editable: boolean;
  onReady?: () => void;
  onTitleChange?: (title: string) => void;
}

export const ArtifactDraw: React.FC<Props> = memo((props) => {
  const yDoc = props.y instanceof YDoc ? props.y : props.y.document;
  const yMeta = useObserveYArtifactMeta(yDoc);
  const title = yMeta.title ?? '';
  const theme = yMeta.theme ?? 'default';
  const titleBodyMerge = yMeta.titleBodyMerge ?? true;
  const { session } = useContext(SessionContext);
  const { getPreference } = useContext(PreferencesContext);
  const { t } = useTranslation();

  const preferredUserColor = getPreference(PreferenceNames.CollaborationColor);

  useEffect(() => {
    if (props.y instanceof TiptapCollabProvider) {
      props.y.awareness?.setLocalStateField('user', {
        name: session ? session.email : t('generic.anonymous'),
        color: preferredUserColor,
      });
    }
  }, [session, preferredUserColor]);

  const store = useYjsTLDrawStore({
    yProvider: props.y,
    shapeUtils: [],
    editable: props.editable,
  });

  const setMetaProp = (metaPropName: string, value: any) => {
    (yDoc.getMap(ARTIFACT_META_KEY) as any).set(metaPropName, value);
  };

  const titleInput = (
    <IonItem lines="none" className="artifactTitle">
      <ArtifactTitleInput
        disabled={!props.editable}
        placeholder={t('artifactRenderer.title.placeholder')}
        value={title}
        onIonInput={(event) => {
          setMetaProp('title', event.target.value || '');
          props.onTitleChange?.((event.target.value || '').toString());
        }}
        type="text"
      ></ArtifactTitleInput>
    </IonItem>
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {!titleBodyMerge && titleInput}
      <ArtifactDrawStyles
        data-theme={theme}
        style={{ width: '100%', height: '100%' }}
      >
        {titleBodyMerge && titleInput}

        <Tldraw store={store} />
      </ArtifactDrawStyles>
    </div>
  );
});
