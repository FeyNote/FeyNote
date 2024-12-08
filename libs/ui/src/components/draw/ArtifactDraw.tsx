import { TiptapCollabProvider } from '@hocuspocus/provider';
import { Doc as YDoc } from 'yjs';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import type { ArtifactDTO, FileDTO } from '@feynote/global-types';
import { ARTIFACT_META_KEY, PreferenceNames } from '@feynote/shared-utils';
import { useTranslation } from 'react-i18next';
import { IonItem } from '@ionic/react';
import { ArtifactTitleInput } from '../editor/ArtifactTitleInput';
import { ArtifactDrawStyles } from './ArtifactDrawStyles';
import { PreferencesContext } from '../../context/preferences/PreferencesContext';
import { SessionContext } from '../../context/session/SessionContext';
import {
  ArrowDownToolbarItem,
  ArrowLeftToolbarItem,
  ArrowRightToolbarItem,
  ArrowToolbarItem,
  ArrowUpToolbarItem,
  CheckBoxToolbarItem,
  CloudToolbarItem,
  DefaultMainMenu,
  DefaultQuickActions,
  DefaultToolbar,
  DiamondToolbarItem,
  DrawToolbarItem,
  EditMenuSubmenu,
  Editor,
  EditSubmenu,
  EllipseToolbarItem,
  EraserToolbarItem,
  ExportFileContentSubMenu,
  FrameToolbarItem,
  getUserPreferences,
  HandToolbarItem,
  HexagonToolbarItem,
  HighlightToolbarItem,
  LineToolbarItem,
  NoteToolbarItem,
  OvalToolbarItem,
  PreferencesGroup,
  RectangleToolbarItem,
  RhombusToolbarItem,
  SelectToolbarItem,
  setUserPreferences,
  StarToolbarItem,
  TextToolbarItem,
  TLAssetStore,
  TLComponents,
  Tldraw,
  TldrawUiMenuGroup,
  TldrawUiMenuItem,
  TldrawUiMenuSubmenu,
  TLUiOverrides,
  ToggleEdgeScrollingItem,
  ToggleFocusModeItem,
  ToggleGridItem,
  ToggleReduceMotionItem,
  ToggleSnapModeItem,
  ToggleToolLockItem,
  ToggleWrapModeItem,
  TriangleToolbarItem,
  UndoRedoGroup,
  useActions,
  useCanRedo,
  useCanUndo,
  ViewSubmenu,
  XBoxToolbarItem,
} from 'tldraw';
import 'tldraw/tldraw.css';
import { useYjsTLDrawStore } from './useYjsTLDrawStore';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import styled from 'styled-components';
import { CollaborationManagerConnection } from '../editor/collaborationManager';

const ArtifactDrawContainer = styled.div<{ $titleBodyMerge: boolean }>`
  display: grid;
  height: 100%;
  grid-template-rows: ${(props) =>
    props.$titleBodyMerge ? 'auto' : 'min-content auto'};
`;

const StyledArtifactDrawStyles = styled(ArtifactDrawStyles)<{
  $titleBodyMerge: boolean;
}>`
  display: grid;
  grid-template-rows: ${(props) =>
    props.$titleBodyMerge ? 'min-content auto' : 'auto'};
`;

type DocArgOptions =
  | {
      collaborationConnection: CollaborationManagerConnection;
      yDoc?: undefined;
    }
  | {
      collaborationConnection?: undefined;
      yDoc: YDoc;
    };

type Props = {
  knownReferences: Map<string, KnownArtifactReference>;
  incomingArtifactReferences: ArtifactDTO['incomingArtifactReferences'];
  editable: boolean;
  onReady?: () => void;
  onTitleChange?: (title: string) => void;
  handleFileUpload?: (file: File) => Promise<FileDTO>;
  getFileUrl: (fileId: string) => string;
} & DocArgOptions;

export const ArtifactDraw: React.FC<Props> = memo((props) => {
  const yDoc = props.yDoc || props.collaborationConnection.yjsDoc;
  const yMeta = useObserveYArtifactMeta(yDoc);
  const title = yMeta.title ?? '';
  const theme = yMeta.theme ?? 'default';
  const titleBodyMerge = yMeta.titleBodyMerge ?? true;
  const { session } = useContext(SessionContext);
  const { getPreference } = useContext(PreferencesContext);
  const { t } = useTranslation();

  const preferredUserColor = getPreference(PreferenceNames.CollaborationColor);

  useEffect(() => {
    if (props.collaborationConnection) {
      props.collaborationConnection.tiptapCollabProvider.awareness?.setLocalStateField(
        'user',
        {
          name: session ? session.email : t('generic.anonymous'),
          color: preferredUserColor,
        },
      );
    }
  }, [props.collaborationConnection, session, preferredUserColor]);

  const store = useYjsTLDrawStore({
    handleFileUpload: props.handleFileUpload,
    getFileUrl: props.getFileUrl,
    shapeUtils: [],
    editable: props.editable,
    ...(props.yDoc
      ? {
          yDoc: props.yDoc,
        }
      : {
          collaborationConnection: props.collaborationConnection,
        }),
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

  const onMount = (editor: Editor) => {
    const themePreference = getPreference(PreferenceNames.Theme);
    let colorScheme: 'dark' | 'light' | 'system' = 'system';
    if (themePreference === 'light') colorScheme = 'light';
    if (themePreference === 'dark') colorScheme = 'dark';

    const languagePreference = getPreference(PreferenceNames.Language);

    setUserPreferences({
      id: getUserPreferences().id,
      colorScheme,
      locale: languagePreference,
    });
  };

  const components: TLComponents = {
    NavigationPanel: null,
    Toolbar: () => (
      <DefaultToolbar>
        <SelectToolbarItem />
        <HandToolbarItem />
        <DrawToolbarItem />
        <EraserToolbarItem />
        <ArrowToolbarItem />
        <TextToolbarItem />
        <NoteToolbarItem />
        <RectangleToolbarItem />
        <EllipseToolbarItem />
        <TriangleToolbarItem />
        <DiamondToolbarItem />
        <HexagonToolbarItem />
        <OvalToolbarItem />
        <RhombusToolbarItem />
        <StarToolbarItem />
        <CloudToolbarItem />
        <XBoxToolbarItem />
        <CheckBoxToolbarItem />
        <ArrowLeftToolbarItem />
        <ArrowRightToolbarItem />
        <ArrowUpToolbarItem />
        <ArrowDownToolbarItem />
        <LineToolbarItem />
        <HighlightToolbarItem />
        <FrameToolbarItem />
      </DefaultToolbar>
    ),
    QuickActions: () => {
      const canUndo = useCanUndo();
      const canRedo = useCanRedo();
      const actions = useActions();
      return (
        <DefaultQuickActions>
          <TldrawUiMenuItem {...actions.undo} disabled={!canUndo} />
          <TldrawUiMenuItem {...actions.redo} disabled={!canRedo} />
        </DefaultQuickActions>
      );
    },
    PageMenu: null,
    MainMenu: () => {
      return (
        <DefaultMainMenu>
          <EditSubmenu />
          <ViewSubmenu />
          <ExportFileContentSubMenu />
          <TldrawUiMenuSubmenu id="preferences" label="menu.preferences">
            <ToggleSnapModeItem />
            <ToggleGridItem />
            <ToggleWrapModeItem />
            <ToggleEdgeScrollingItem />
            <ToggleReduceMotionItem />
          </TldrawUiMenuSubmenu>
        </DefaultMainMenu>
      );
    },
  };

  return (
    <ArtifactDrawContainer $titleBodyMerge={titleBodyMerge}>
      {!titleBodyMerge && titleInput}
      <StyledArtifactDrawStyles
        data-theme={theme}
        $titleBodyMerge={titleBodyMerge}
      >
        {titleBodyMerge && titleInput}

        <Tldraw
          store={store}
          acceptedImageMimeTypes={['image/jpeg', 'image/png']}
          acceptedVideoMimeTypes={[]}
          maxImageDimension={Infinity}
          maxAssetSize={10 * 1024 * 1024}
          onMount={onMount}
          components={components}
          cameraOptions={{
            zoomSteps: [0.05, 0.1, 0.25, 0.5, 1, 2, 4, 8],
            wheelBehavior: 'zoom',
          }}
        />
      </StyledArtifactDrawStyles>
    </ArtifactDrawContainer>
  );
});
