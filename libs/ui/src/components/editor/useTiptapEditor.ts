import { useEditor } from '@tiptap/react';
import { PreferenceNames } from '@feynote/shared-utils';
import { Doc as YDoc } from 'yjs';

import { TiptapCollabProvider } from '@hocuspocus/provider';
import { KnownArtifactReference } from './tiptap/extensions/artifactReferences/KnownArtifactReference';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useMemo } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { PreferencesContext } from '../../context/preferences/PreferencesContext';
import { getTiptapExtensions } from './tiptap/getTiptapExtensions';

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
  editable: boolean;
  knownReferences?: Map<string, KnownArtifactReference>;
  onReady?: () => void;
} & DocArgOptions;

export const useArtifactEditor = (args: UseArtifactEditorArgs) => {
  const { t } = useTranslation();
  const { session } = useContext(SessionContext);
  const { getPreference } = useContext(PreferencesContext);
  const knownReferences = useMemo(() => {
    return args.knownReferences ? args.knownReferences : new Map();
  }, [args.knownReferences]);

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
    placeholder,
    editable: args.editable,
    collaborationUser,
    knownReferences,
    y: args.yDoc
      ? {
          yDoc: args.yDoc,
        }
      : {
          yjsProvider: args.yjsProvider,
        },
  });

  const editor = useEditor({
    editable: args.editable,
    extensions,
    onCreate: () => {
      args.onReady?.();
    },
  });

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
