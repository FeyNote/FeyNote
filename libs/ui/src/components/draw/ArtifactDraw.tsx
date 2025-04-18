import { Doc as YDoc } from 'yjs';
import { memo, useContext, useEffect } from 'react';
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
  CheckBoxToolbarItem,
  CloudToolbarItem,
  DefaultMainMenu,
  DefaultQuickActions,
  DefaultToolbar,
  DiamondToolbarItem,
  DrawToolbarItem,
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
  RectangleToolbarItem,
  RhombusToolbarItem,
  SelectToolbarItem,
  setUserPreferences,
  StarToolbarItem,
  TextToolbarItem,
  TLComponents,
  Tldraw,
  TldrawUiMenuItem,
  TldrawUiMenuSubmenu,
  TLUiAssetUrlOverrides,
  TLUiOverrides,
  ToggleEdgeScrollingItem,
  ToggleGridItem,
  ToggleReduceMotionItem,
  ToggleSnapModeItem,
  ToggleWrapModeItem,
  TriangleToolbarItem,
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
import { TLDrawCustomStylePanel } from './TLDrawCustomStylePanel';
import { t } from 'i18next';

const ARTIFACT_DRAW_META_KEY = 'artifactDrawMeta';
const MAX_ASSET_SIZE_MB = 25;

export const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    // Create a tool item in the ui's context.
    tools.reference = {
      id: 'referenceInsertion',
      icon: 'pin-icon',
      label: t('draw.tool.reference'),
      kbd: 'p',
      onSelect: () => {
        editor.setCurrentTool('referenceInsertion');
      },
    };
    return tools;
  },
};

const customTools = [TLDrawReferenceShapeTool];
const customShapeUtils = [TLDrawReferenceUtil];
const customAssetUrls: TLUiAssetUrlOverrides = {
  icons: {
    'pin-icon':
      'https://static.feynote.com/assets/fa-map-pin-solid-tldrawscale-20241219.svg',
  },
};

const ArtifactDrawContainer = styled.div`
  display: grid;
  height: 100%;
  grid-template-rows: auto;
`;

const StyledArtifactDrawStyles = styled(ArtifactDrawStyles)`
  display: grid;
  grid-template-rows: min-content auto;
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
    StylePanel: TLDrawCustomStylePanel,
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
    <ArtifactDrawContainer data-print-target={`artifact:${props.artifactId}`}>
      <StyledArtifactDrawStyles data-theme={theme}>
        {titleInput}

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
            assetUrls={customAssetUrls}
            overrides={uiOverrides}
          >
            <CreateReferenceOverlayWrapper />
          </Tldraw>
        </TLDrawArtifactIdContext.Provider>
      </StyledArtifactDrawStyles>
    </ArtifactDrawContainer>
  );
});
