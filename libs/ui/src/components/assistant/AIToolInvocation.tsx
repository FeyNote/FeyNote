import { type UIDataTypes, type UIMessagePart, type ChatStatus } from 'ai';
import { Spinner } from '@radix-ui/themes';
import { getEditorContentsFromToolPart } from '../../utils/assistant/getEditorContentsFromToolInvocation';
import { AIEditor } from './AIEditor';
import type { FeynoteUITool } from '@feynote/shared-utils';
import { useCallback, useEffect, useMemo } from 'react';
import { Doc as YDoc } from 'yjs';
import { generateJSON } from '@tiptap/html';
import { getTiptapExtensions } from '../editor/tiptap/getTiptapExtensions';
interface Props {
  part: UIMessagePart<UIDataTypes, FeynoteUITool>;
  messageId: string;
  retryMessage: (messageId: string) => void;
  aiStatus: ChatStatus;
}

export const AIToolPart = (props: Props) => {
  const yDoc = useMemo(() => new YDoc(), []);
  useEffect(() => () => yDoc.destroy(), [yDoc]);

  const extensions = useMemo(
    () =>
      getTiptapExtensions({
        artifactId: undefined,
        placeholder: '',
        editable: false,
        y: { yDoc },
        collaborationUser: {},
        getFileUrl: () => '',
      }),
    [yDoc],
  );

  const htmlToJson = useCallback(
    (html: string) => generateJSON(html, extensions)['content'],
    [extensions],
  );

  const toolPartContents = useMemo(
    () => getEditorContentsFromToolPart(props.part, htmlToJson),
    [props.part, htmlToJson],
  );
  if (!toolPartContents.length) return <Spinner />;

  return (
    <>
      {toolPartContents.map((content, i) => (
        <AIEditor
          key={i}
          messageId={props.messageId}
          aiStatus={props.aiStatus}
          retryMessage={props.retryMessage}
          editorContent={content}
        />
      ))}
    </>
  );
};
