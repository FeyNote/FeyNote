import { Editor, useEditor } from '@tiptap/react';
import { PreferenceNames } from '@feynote/shared-utils';
import { Doc as YDoc } from 'yjs';

import { TiptapCollabProvider } from '@hocuspocus/provider';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useMemo } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { PreferencesContext } from '../../context/preferences/PreferencesContext';
import { getTiptapExtensions } from './tiptap/getTiptapExtensions';
import type { TableOfContentData } from '@tiptap-pro/extension-table-of-contents';

type DocArgOptions =
  | {
      yjsProvider: TiptapCollabProvider;
      yDoc?: undefined;
    }
  | {
      yjsProvider?: undefined;
      yDoc: YDoc;
    };

type UseArtifactEditorArgs = {
  artifactId: string | undefined; // Passing undefined here will disable artifact reference text lookup
  editable: boolean;
  onReady?: () => void;
  handleFileUpload?: (editor: Editor, files: File[], pos?: number) => void;
  getFileUrl: (fileId: string) => Promise<string> | string;
  onTocUpdate?: (content: TableOfContentData) => void;
  onRollDice?: (roll: string) => void;
  onIncomingReferenceCounterMouseOver?: (
    event: MouseEvent,
    blockId: string,
  ) => void;
  onIncomingReferenceCounterMouseOut?: (event: MouseEvent) => void;
} & DocArgOptions;

export const useTiptapEditor = (args: UseArtifactEditorArgs) => {
  const { t } = useTranslation();
  const { session } = useContext(SessionContext);
  const { getPreference } = useContext(PreferencesContext);

  const preferredUserColor = getPreference(PreferenceNames.CollaborationColor);

  const collaborationUser = useMemo(
    () => ({
      name: session ? session.email : t('generic.anonymous'),
      color: preferredUserColor,
    }),
    [],
  );

  const placeholder = args.editable
    ? t('editor.placeholder')
    : t('editor.placeholder.readOnlyEmpty');

  const extensions = getTiptapExtensions({
    artifactId: args.artifactId,
    placeholder,
    editable: args.editable,
    handleFileUpload: args.handleFileUpload,
    getFileUrl: args.getFileUrl,
    collaborationUser,
    y: args.yDoc
      ? {
          yDoc: args.yDoc,
        }
      : {
          yjsProvider: args.yjsProvider,
        },
    onTocUpdate: args.onTocUpdate,
    onRollDice: args.onRollDice,
    onIncomingReferenceCounterMouseOver:
      args.onIncomingReferenceCounterMouseOver,
    onIncomingReferenceCounterMouseOut: args.onIncomingReferenceCounterMouseOut,
  });

  const editor = useEditor({
    editable: args.editable,
    extensions,
    onCreate: () => {
      args.onReady?.();
    },
  });

  useEffect(() => {
    editor?.setOptions({
      editable: args.editable,
    });
  }, [args.editable, editor]);

  useEffect(() => {
    // "updateUser" command is dependent on yjs provider being instantiated
    if (!args.yjsProvider) return;
    editor?.commands.updateUser({
      name: session ? session.email : t('generic.anonymous'),
      color: preferredUserColor,
    });
  }, [session?.email, preferredUserColor]);

  return editor;
};
