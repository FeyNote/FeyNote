import { Doc as YDoc } from 'yjs';
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { FileDTO } from '@feynote/global-types';
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
  BaseBoxShapeTool,
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
  TLClickEventInfo,
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
  useEditor,
  useIsToolSelected,
  useReactor,
  useTools,
  ViewSubmenu,
  XBoxToolbarItem,
} from 'tldraw';
import 'tldraw/tldraw.css';
import { useYjsTLDrawStore } from './useYjsTLDrawStore';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import styled from 'styled-components';
import { CollaborationManagerConnection } from '../editor/collaborationManager';
import { TLDrawCustomGrid } from './TLDrawCustomGrid';
import {
  TLDrawReferenceShapeTool,
  TLDrawReferenceUtil,
} from './TLDrawReference';
import { CreateReferenceOverlayWrapper } from './CreateReferenceOverlayWrapper';
import { TLDrawArtifactIdContext } from './TLDrawArtifactIdContext';

const ARTIFACT_DRAW_META_KEY = 'artifactDrawMeta';
const MAX_ASSET_SIZE_MB = 25;

export const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    // Create a tool item in the ui's context.
    tools.reference = {
      id: 'referenceInsertion',
      icon: 'color',
      label: 'Insert Reference',
      kbd: 'c',
      onSelect: () => {
        editor.setCurrentTool('referenceInsertion');
      },
    };
    return tools;
  },
};

const customTools = [TLDrawReferenceShapeTool];
const customShapeUtils = [TLDrawReferenceUtil];

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
  artifactId: string;
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
    shapeUtils: customShapeUtils,
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

    const showGrid = yDoc.getMap(ARTIFACT_DRAW_META_KEY)?.get('showGrid') as
      | boolean
      | undefined;
    editor.updateInstanceState({
      isGridMode: showGrid ?? true,
    });
  };

  const components: TLComponents = {
    NavigationPanel: null,
    Toolbar: props.editable
      ? () => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const tools = useTools();
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const isReferenceSelected = useIsToolSelected(tools['reference']);

          return (
            <DefaultToolbar>
              <HandToolbarItem />
              <SelectToolbarItem />
              <DrawToolbarItem />
              <EraserToolbarItem />
              <TldrawUiMenuItem
                {...tools['reference']}
                isSelected={isReferenceSelected}
              />
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
          );
        }
      : null,
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
      const editor = useEditor();

      // We add this reactor here since we cannot access these hooks outside of a TLDraw component.
      // It's not technically required that this exist within MainMenu.
      useReactor(
        'isGridMode',
        () => {
          const isGridMode = editor.getInstanceState().isGridMode;

          if (
            isGridMode !== yDoc.getMap(ARTIFACT_DRAW_META_KEY)?.get('showGrid')
          ) {
            yDoc.getMap(ARTIFACT_DRAW_META_KEY)?.set('showGrid', isGridMode);
          }
        },
        [editor],
      );

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
    Grid: TLDrawCustomGrid,
  };

  return (
    <ArtifactDrawContainer $titleBodyMerge={titleBodyMerge}>
      {!titleBodyMerge && titleInput}
      <StyledArtifactDrawStyles
        data-theme={theme}
        $titleBodyMerge={titleBodyMerge}
      >
        {titleBodyMerge && titleInput}

        <TLDrawArtifactIdContext.Provider value={props.artifactId}>
          <Tldraw
            initialState="hand"
            store={store}
            acceptedImageMimeTypes={['image/jpeg', 'image/png']}
            acceptedVideoMimeTypes={[]}
            maxImageDimension={Infinity}
            maxAssetSize={MAX_ASSET_SIZE_MB * 1024 * 1024}
            onMount={onMount}
            components={components}
            cameraOptions={{
              zoomSteps: [0.05, 0.1, 0.25, 0.5, 1, 2, 4, 8],
              wheelBehavior: 'pan',
            }}
            tools={customTools}
            shapeUtils={customShapeUtils}
            overrides={uiOverrides}
          >
            <CreateReferenceOverlayWrapper />
          </Tldraw>
        </TLDrawArtifactIdContext.Provider>
      </StyledArtifactDrawStyles>
    </ArtifactDrawContainer>
  );
});
