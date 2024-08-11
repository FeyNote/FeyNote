import { TiptapCollabProvider } from '@hocuspocus/provider';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import type { ArtifactTheme } from '@prisma/client';
import { ArtifactEditorApplyTemplate } from '../editor/ArtifactEditor';
import { useEffect, useMemo, useReducer } from 'react';
import { IonCard } from '@ionic/react';
import { CalendarRenderer } from './CalendarRenderer';
import type { TypedMap } from 'yjs-types';
import type { ArtifactDTO } from '@feynote/prisma/types';
import type { YCalendarMap } from '@feynote/shared-utils';
import { CalendarConfig } from './CalendarConfig';

interface Props {
  knownReferences: Map<string, KnownArtifactReference>;
  incomingArtifactReferences: ArtifactDTO['incomingArtifactReferences'];
  yjsProvider: TiptapCollabProvider;
  theme: ArtifactTheme;
  applyTemplateRef?: React.MutableRefObject<
    ArtifactEditorApplyTemplate | undefined
  >;
  onReady?: () => void;
}

export const ArtifactCalendar: React.FC<Props> = (props) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const calendarMap = useMemo(
    () =>
      props.yjsProvider.document.getMap('calendar') as TypedMap<
        Partial<YCalendarMap>
      >,
    [_rerenderReducerValue],
  );
  const configMap = useMemo(
    () => calendarMap.get('config'),
    [_rerenderReducerValue, calendarMap],
  );

  useEffect(() => {
    const listener = () => {
      triggerRerender();
    };

    calendarMap.observeDeep(listener);
    return () => calendarMap.unobserveDeep(listener);
  }, [_rerenderReducerValue]);

  if (!configMap) return;

  return (
    <IonCard>
      <CalendarConfig yDoc={props.yjsProvider.document} configMap={configMap} />

      <br />
      <br />

      <CalendarRenderer
        configMap={configMap}
        incomingArtifactReferences={props.incomingArtifactReferences}
      />
    </IonCard>
  );
};
