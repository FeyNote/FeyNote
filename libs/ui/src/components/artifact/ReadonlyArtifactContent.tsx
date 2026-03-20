import { Doc as YDoc } from 'yjs';
import { useObserveYArtifactMeta } from '../../utils/collaboration/useObserveYArtifactMeta';
import { useSessionContext } from '../../context/session/SessionContext';
import { getFileUrlById } from '../../utils/files/getFileUrlById';
import { ArtifactEditor } from '../editor/ArtifactEditor';
import { ArtifactCalendar } from '../calendar/ArtifactCalendar';
import { ArtifactDraw } from '../draw/ArtifactDraw';
import { useScrollBlockIntoView } from '../editor/useScrollBlockIntoView';
import { useScrollDateIntoView } from '../calendar/useScrollDateIntoView';
import { useRef, useState } from 'react';
import { CollaborationConnectionAuthorizationState } from '../../utils/collaboration/collaborationManager';

interface Props {
  artifactId: string;
  yDoc: YDoc;
  onReady?: () => void;
  focusBlockId?: string;
  focusDate?: string;
}

export const ReadonlyArtifactContent: React.FC<Props> = (props) => {
  const { type } = useObserveYArtifactMeta(props.yDoc).meta;
  const sessionContext = useSessionContext(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorReady, setEditorReady] = useState(false);

  useScrollBlockIntoView(
    {
      blockId: props.focusBlockId,
      highlight: true,
      containerRef,
    },
    [editorReady],
  );
  useScrollDateIntoView(
    {
      date: props.focusDate,
      containerRef,
    },
    [editorReady],
  );

  const getFileUrl = (fileId: string) => {
    return getFileUrlById(fileId, sessionContext?.session);
  };

  const render = () => {
    if (type === 'tiptap') {
      return (
        <ArtifactEditor
          artifactId={props.artifactId}
          editable={false}
          authorizationState={
            CollaborationConnectionAuthorizationState.ReadOnly
          }
          yDoc={props.yDoc}
          getFileUrl={getFileUrl}
          onReady={() => {
            props.onReady?.();
            setEditorReady(true);
          }}
        />
      );
    }

    if (type === 'calendar') {
      return (
        <ArtifactCalendar
          artifactId={props.artifactId}
          editable={false}
          y={props.yDoc}
          viewType="fullsize"
          centerDate={props.focusDate}
          onReady={() => {
            props.onReady?.();
            setEditorReady(true);
          }}
        />
      );
    }

    if (type === 'tldraw') {
      return (
        <ArtifactDraw
          artifactId={props.artifactId}
          editable={false}
          yDoc={props.yDoc}
          getFileUrl={getFileUrl}
          onReady={() => {
            props.onReady?.();
            setEditorReady(true);
          }}
        />
      );
    }

    return null;
  };

  return <div ref={containerRef}>{render()}</div>;
};
